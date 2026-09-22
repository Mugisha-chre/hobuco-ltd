const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const nodemailer = require('nodemailer');
const methodOverride = require('method-override');
const ExcelJS = require('exceljs');
const db = require('./db/db');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Add this line to parse JSON bodies
app.use(express.json());

// If you also want to parse URL-encoded data (form data), add this too:
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'consulting_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 1 week
}));
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.set("view engine","ejs");

// Database is initialized in ./db/db.js (self-contained, file-based, no
// external MySQL server required — safe to deploy anywhere, including Render).

// Nodemailer setup.
// On platforms like Render there is usually no outbound SMTP configured, so by
// default mail sending is muted/disabled (emails are logged instead of sent)
// to guarantee the site keeps working end-to-end. To enable real email
// delivery, set SMTP_ENABLED=true along with SMTP_USER and SMTP_PASS
// (a Gmail App Password) as environment variables.
const MAIL_ENABLED = String(process.env.SMTP_ENABLED || '').toLowerCase() === 'true';

const transporter = MAIL_ENABLED
  ? nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  : {
      // Safe no-op mail transport: keeps every existing "await
      // transporter.sendMail(...)" call working without ever needing SMTP.
      sendMail: (mailOptions, callback) => {
        console.log('[mail muted] Would have sent email to:', mailOptions && mailOptions.to, '| subject:', mailOptions && mailOptions.subject);
        const info = { messageId: 'muted', accepted: [], rejected: [] };
        if (typeof callback === 'function') {
          callback(null, info);
          return;
        }
        return Promise.resolve(info);
      }
    };


// In-memory store for reset confirmation codes (for demo only!)
const resetCodes = {};

// ROUTES
app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }
  if (req.cookies.username) {
    req.session.user = { username: req.cookies.username, role: req.cookies.role };
    return res.redirect("/dashboard");
  }
  res.render('home');
});


//Getting LOGIN page
app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('ejs/autho/login');
});


// Dashboard
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const role = req.session.user.role;
  const username = req.session.user.username;

  // Fetch consultations and users for admin and manager users
  if (role === 'admin' || role === 'manager') {
    // Query both consultations and users
    const consultationsQuery = "SELECT * FROM consultations ORDER BY submitted_at DESC";
    const usersQuery = "SELECT * FROM users";

    // Execute both queries in parallel
    Promise.all([
      new Promise((resolve, reject) => {
        db.query(consultationsQuery, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(usersQuery, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      })
    ])
    .then(([consultations, users]) => {
      // Parse user statistics
      const admins = users.filter(user => user.role === 'admin');
      const clients = users.filter(user => user.role === 'client');
      const managers = users.filter(user => user.role === 'manager');

      // Helper to get class based on first letter
      function getAvatarColor(name) {
        const firstLetter = name.charAt(0).toLowerCase();
        return 'avatar-' + firstLetter;
      }

      res.render(`ejs/dashboard/dashboard-${role}`, {
        username,
        role,
        consultations,
        getAvatarColor,
        totalConsultations: consultations.length,
        totalUsers: users.length,
        totalAdmins: admins.length,
        totalClients: clients.length,
        totalManagers: managers.length
      });
    })
    .catch(err => {
      console.error("Error fetching data:", err);
      return res.status(500).send("Internal Server Error");
    });

  } else {
    // For non-admin/manager users
    res.redirect('/client');
  }
});


// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

// Forgot password page
app.get('/forgot', (req, res) => {
  res.render('ejs/autho/forgot');

});

// Handle forgot password - send code to email
app.post('/forgot', (req, res) => {
  const { email } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.send('Database error');
    if (results.length === 0) return res.send('Email not found');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    resetCodes[email] = code;

    const mailOptions = {
      from: '"HOBUCO Consulting Services" mugishatumusifuchretien@gmail.com',
      to: email,
      subject: "HOBUCO Password Reset Confirmation Code",
      html: `
        <div style="padding: 30px; text-align: center; font-family: Arial, sans-serif;">
          <p style="font-size: 14px; color: #333;">Your confirmation code is:</p>
          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <span style="font-size: 24px; font-weight: 700; color: #1976d2; letter-spacing: 2px;">
              ${code}
            </span>
          </div>
          <p style="font-size: 12px; color: #666;">Please use this code to reset your password</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.send("Failed to send confirmation code email");
      }
      req.session.resetEmail = email;
      res.redirect('/verify-code');
    });
  });
});


// Verify code page
app.get('/verify-code', (req, res) => {
  if (!req.session.resetEmail) return res.redirect('/');
  res.render('ejs/autho/verify-code');
});

// Handle code verification + password reset
app.post('/verify-code', (req, res) => {
  const code = req.body.code;
  const email = req.session.resetEmail;

  if (resetCodes[email] === code) {
    // Code matches → show reset password form
    return res.redirect('/reset-password');
  } else {
    return res.send("Invalid code. Please try again.");
  }
});

//reset-password
app.get('/reset-password', (req, res) => {
  res.render('ejs/autho/reset-password');
});



app.post('/reset-password', (req, res) => {
  const email = req.session.resetEmail;
  const password = req.body.password;

  if (!password) return res.send('Password is required.');

  bcrypt.hash(password, 10).then((hashedPassword) => {
    db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email], (err) => {
      if (err) return res.send('Database error');
      else if (req.session.user) {
    return res.redirect("/dashboard");
  } else {
    res.redirect("/login");
  }
    });
  }).catch((err) => {
    console.error(err);
    res.send('Error hashing password');
  });
});






//HANDLE Signup
app.post('/signup', async (req, res) => {
  const { username, email, password, role } = req.body;
  const userRole = role || 'client';

  if (!username || !email || !password) {
    return res.json({
      success: false,
      message: 'All fields are required!'
    });
  }

  db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.json({
        success: false,
        message: 'Server error. Please try again.'
      });
    }

    if (results.length > 0) {
      const existingUser = results[0];
      if (existingUser.username === username) {
        return res.json({
          success: false,
          message: 'Username is already taken.'
        });
      } else if (existingUser.email === email) {
        return res.json({
          success: false,
          message: 'Email is already registered.'
        });
      }
    }

    const hashed = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashed, userRole],
      async (err) => {
        if (err) {
          console.error('Account creation error:', err);
          return res.json({
            success: false,
            message: 'Failed to create account. Try again.'
          });
        }

        // After inserting user, send welcome email
        const mailOptions = {
          from: '"HOBUCO Consulting Services" <mugishatumusifuchretien@gmail.com>',
          to: email,
          subject: "Welcome to HOBUCO - Your Account Has Been Created!",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
              <h2 style="color: #2c3e50;">Welcome to HOBUCO Consulting Services, ${username.charAt(0).toUpperCase() + username.slice(1)}!</h2>
              <p style="font-size: 16px;">We’re excited to have you on board. Your account has been successfully created.</p>
              
              <hr style="margin: 20px 0;">

              <h3 style="color: #2980b9;">WHO WE ARE</h3>
              <p style="font-size: 15px; color: #555;">
                HOBUCO Ltd, established in the year 2016, is one of the multidisciplinary consulting firms in Rwanda that is goal-oriented 
                towards providing sustainable solutions to the challenges in the global consulting arena.
              </p>

              <h3 style="color: #2980b9;">OUR PARTNERS</h3>
              <ul style="font-size: 15px; color: #555;">
                <li>TerraFund for AFR100 / World Resource Institute</li>
                <li>Commission Episcopale Justice et Paix - CEJP</li>
                <li>reNature Investments BV</li>
                <li>This SIDE Up</li>
              </ul>

              <h3 style="color: #2980b9;">CONTACT US</h3>
              <p style="font-size: 15px; color: #555;">
                <strong>Office Location:</strong> Muhanga District<br>
                <strong>Telephone:</strong> +250788696388 / +250788213984<br>
                <strong>Email:</strong> hobucoltd2050@gmail.com
              </p>

              <hr style="margin: 20px 0;">

              <p style="font-size: 14px; color: #999;">
                This is notifying message. Please do not reply to this email.
              </p>
            </div>
          `
        };

        try {
          await transporter.sendMail(mailOptions);
        } catch (emailError) {
          console.error('Error sending welcome email:', emailError);
        }

        return res.json({
          success: true,
          message: 'Signup successful! You can now log in.'
        });
      }
    );
  });
});





app.post('/login', (req, res) => {
  const { username, password, remember } = req.body;
  
  // Validate input
  if (!username) {
    return res.json({
      success: false,
      message: 'Username or email is required!'
    });
  }

  //password missing
  if (!password){
    return res.json({
      success: false,
      message: 'Password is required!'
    });
  }
  
  // Query for either username or email match
  db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, username], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.json({
        success: false,
        message: 'A server error occurred. Please try again later.'
      });
    }
    
    if (results.length === 0) {
      return res.json({
        success: false,
        message: 'Username or Email not found'

      });
    }
    
    try {
      const valid = await bcrypt.compare(password, results[0].password);
      
      if (!valid) {
        return res.json({
          success: false,
          message: 'Incorrect password'
        });
      }
      
      // Login successful
      req.session.user = results[0];
      
      // Handle "Remember Me" functionality
      if (remember) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      } else {
        req.session.cookie.expires = false; // session ends on browser close
      }
      
      return res.json({
        success: true,
        message: 'Login successful',
        redirectUrl: '/dashboard'
      });
      
    } catch (bcryptError) {
      console.error('Bcrypt error:', bcryptError);
      return res.json({
        success: false, 
        message: 'An error occurred while verifying your password. Please try again.'
      });
    }
  });
});





//setting up route for about page
app.get('/about',(req,res)=>{
    res.render('ejs/web/about');
});



//setting up route for services page
app.get('/services',(req,res)=>{
    res.render('ejs/web/services');
});





//setting up route for contact page
app.get('/contact-us',(req,res)=>{
    res.render('ejs/web/contact-us');
});










// Route to handle consultation form
app.post('/book-consultation', async (req, res) => {
  const { firstName, lastName, email, phone, companyOrg, subject, service, message } = req.body;

  const sql = `INSERT INTO consultations 
    (first_name, last_name, email, phone, company_org, subject, service, message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [firstName, lastName, email, phone, companyOrg, subject, service, message], async (err, result) => {
    if (err) {
      console.error('Error saving data:', err);
      return res.status(500).send('Server error');
    }

    try {
      // 1️⃣ Send confirmation email to user
      const userMailOptions = {
        from: '"HOBUCO Consulting Services" <mugishatumusifuchretien@gmail.com>',
        to: email,
        subject: "Consultation Request Received",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #ffffff; border: 1px solid #eaeaea; border-radius: 8px;">
            <h2 style="color:#0b5cf5; margin-bottom: 12px;">Thank you for your consultation request, ${firstName}!</h2>
            <p style="font-size:15px; color:#333; line-height:1.6;">
              We’re very happy to confirm that we’ve received your consultation request. Here are the details you submitted:
            </p>
            <ul style="list-style: none; padding: 0; margin: 16px 0; font-size:15px; color:#333;">
              <li style="margin-bottom: 8px;"><strong style="color: #0b5cf5;">📌 Subject:</strong> ${subject}</li>
              <li style="margin-bottom: 8px;"><strong style="color: #0b5cf5;">🛠 Service:</strong> ${service}</li>
              <li style="margin-bottom: 8px;"><strong style="color: #0b5cf5;">🏢 Organization:</strong> ${companyOrg}</li>
            </ul>
            <p style="font-size:15px; color:#333; line-height:1.6;">
              Our consulting team will review your request and contact you shortly to discuss the next steps.
            </p>
            <div style="margin-top:24px; padding:14px; background:#f7faff; border-left:4px solid #0b5cf5; border-radius:6px; font-size:14px; color:#444; line-height:1.6;">
              ⏱️ <strong>Expected response time:</strong> within <span style="color:#0b5cf5;">2–3 business days</span>.
              <br>
              If your request is urgent, please reply to this email with <strong>“Urgent”</strong> in the subject line.
            </div>
            <p style="color: #555; font-size:14px; margin-top: 30px; line-height:1.6;">
              Best regards,<br>
              <strong style="color:#0b5cf5;">HOBUCO Consulting Team</strong>
            </p>
            <hr style="border:none; border-top:1px solid #eaeaea; margin: 20px 0;">
            <p style="font-size:12px; color:#888; line-height:1.4; margin:0;">
              📩 <a href="mailto:hobucoltd2050@gmail.com" style="color:#0b5cf5; text-decoration:none;">hobucoltd2050@gmail.com</a>  
              | 🌐 <a href="https://www.hobuco.com" style="color:#0b5cf5; text-decoration:none;">www.hobuco.com</a>
            </p>
          </div>
        `
      };

      await transporter.sendMail(userMailOptions);

      // 2️⃣ Send notification email to yourself (the admin)
      const adminMailOptions = {
        from: '"HOBUCO Consulting Services" <mugishatumusifuchretien@gmail.com>',
        to: "mugishatumusifuchretien@gmail.com", 
        subject: "📥 New Consultation Request Submitted",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto; padding:20px; background:#f9f9f9; border:1px solid #ddd; border-radius:8px;">
            <h2 style="color:#0b5cf5;">New Consultation Request Received</h2>
            <p style="font-size:15px; color:#333; line-height:1.6;">
              A new consultation request has been submitted. Here are the details:
            </p>
            <ul style="list-style: none; padding:0; margin:16px 0; font-size:15px; color:#333;">
              <li><strong>👤 Name:</strong> ${firstName} ${lastName}</li>
              <li><strong>📧 Email:</strong> ${email}</li>
              <li><strong>📞 Phone:</strong> ${phone}</li>
              <li><strong>🏢 Organization:</strong> ${companyOrg}</li>
              <li><strong>📌 Subject:</strong> ${subject}</li>
              <li><strong>🛠 Service:</strong> ${service}</li>
            </ul>
            <p style="font-size:15px; color:#333; line-height:1.6;">
              <strong>Message:</strong><br>
              ${message || "No additional message provided."}
            </p>
            <p style="margin-top:20px; font-size:14px; color:#666;">
              📅 Submitted at: ${new Date().toLocaleString()}
            </p>
          </div>
        `
      };

      await transporter.sendMail(adminMailOptions);

    } catch (emailError) {
      console.error('Error sending emails:', emailError);
    }

    // Redirect logic
    if (req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'manager')) {
      return res.redirect('/consultations');
    }

    const referer = req.headers.referer || '/';
    res.redirect(referer);
  });
});


// Dashboard
app.get('/consultations', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const role = req.session.user.role;
  const username = req.session.user.username;

  // Only fetch consultations for admin and manager users
  if (role === 'admin' || role === 'manager') {
    const sql = "SELECT * FROM consultations ORDER BY submitted_at DESC";

    db.query(sql, (err, results) => {
      if (err) {
        console.error("Error fetching consultations:", err);
        return res.status(500).send("Internal Server Error");
      }

      // Helper to get class based on first letter
      function getAvatarColor(name) {
        const firstLetter = name.charAt(0).toLowerCase();
        return 'avatar-' + firstLetter;
      }

      // Render appropriate template based on role
      const templatePath = role === 'admin' ? 
        'ejs/dashboard-admin/consultations' : 
        'ejs/dashboard-manager/consultations';

      res.render(templatePath, {
        username,
        role,
        consultations: results,
        getAvatarColor,
        totalConsultations: results.length
      });
    });
  } else {
    // For other users, render their dashboard
    res.render(`ejs/dashboard/dashboard-${role}`, {
      username,
      role
    });
  }
});

// Get full consultation
app.get('/consultations/api/:id', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  
  // Allow admin, manager and client to access consultation details
  if (req.session.user.role !== 'admin' && req.session.user.role !== 'manager' && req.session.user.role !== 'client') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  db.query('SELECT * FROM consultations WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(results[0]);
  });
});

// Update consultation
// Update consultation
app.post('/consultations/update/:id', (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ success: false, message: 'Unauthorized - Please login' });
    if (!['admin', 'manager', 'client'].includes(req.session.user.role))
      return res.status(403).json({ success: false, message: 'Forbidden - Insufficient permissions' });

    const { id } = req.params;
    const { first_name, last_name, email, phone, subject, companyOrg, service, message } = req.body;

    console.log('Received update request for ID:', id); // Debug log
    console.log('Request body:', req.body); // Debug log

    // Get old data
    db.query('SELECT * FROM consultations WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Database error (select):', err);
        return res.status(500).json({ success: false, message: 'Database error occurred' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'Consultation not found' });
      }

      const old = results[0];
      console.log('Old data:', old); // Debug log

      // Map new data - ensure all values are strings
      const newData = {
        first_name: String(first_name || '').trim(),
        last_name: String(last_name || '').trim(),
        email: String(email || '').trim(),
        phone: String(phone || '').trim(),
        subject: String(subject || '').trim(),
        company_org: String(companyOrg || '').trim(),
        service: String(service || '').trim(),
        message: String(message || '').trim()
      };

      const oldData = {
        first_name: String(old.first_name || '').trim(),
        last_name: String(old.last_name || '').trim(),
        email: String(old.email || '').trim(),
        phone: String(old.phone || '').trim(),
        subject: String(old.subject || '').trim(),
        company_org: String(old.company_org || '').trim(),
        service: String(old.service || '').trim(),
        message: String(old.message || '').trim()
      };

      console.log('New data:', newData); // Debug log
      console.log('Old data processed:', oldData); // Debug log

      // Check if anything changed
      let changed = false;
      let changedFields = [];
      
      for (let key in newData) {
        if (newData[key] !== oldData[key]) {
          changed = true;
          changedFields.push(key);
        }
      }

      console.log('Changed:', changed, 'Fields:', changedFields); // Debug log

      if (!changed) {
        return res.json({ success: false, message: 'Please make any change to update the consultation.' });
      }

      // Update in DB
      const query = `
        UPDATE consultations SET
          first_name=?, last_name=?, email=?, phone=?,
          subject=?, company_org=?, service=?, message=?
        WHERE id=?
      `;
      const params = [
        newData.first_name, newData.last_name, newData.email, newData.phone,
        newData.subject, newData.company_org, newData.service, newData.message,
        id
      ];

      console.log('Update query params:', params); // Debug log

      db.query(query, params, (err, updateResult) => {
        if (err) {
          console.error('Database error (update):', err);
          return res.json({ success: false, message: 'Error updating consultation' });
        }
        
        console.log('Update result:', updateResult); // Debug log
        res.json({ success: true, message: 'Consultation updated successfully', redirect: '/dashboard' });
      });
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ success: false, message: 'An unexpected error occurred' });
  }
});


// Delete consultation
app.delete('/consultations/delete/:id', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  if (req.session.user.role !== 'admin' && req.session.user.role !== 'manager' && req.session.user.role !== 'client') 
    return res.status(403).send('Unauthorized');

  const id = req.params.id;
  db.query('DELETE FROM consultations WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).send('Failed to delete consultation');
    res.sendStatus(200);
  });
});

// Export excel file
app.get('/export/consultations', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  if (req.session.user.role !== 'admin' && req.session.user.role !== 'manager') 
    return res.status(403).send('Unauthorized');

  db.query('SELECT * FROM consultations', async (err, results) => {
    if (err) return res.status(500).send("Database error");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Consultations');

    // Define columns
    worksheet.columns = [
      { header: 'First Name', key: 'first_name', width: 20 },
      { header: 'Last Name', key: 'last_name', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Subject', key: 'subject', width: 20 },
      { header: 'Company', key: 'company_org', width: 25 },
      { header: 'Service', key: 'service', width: 25 },
      { header: 'Message', key: 'message', width: 30 },
    ];

    // Add header row styling (bold + border)
    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true };
      cell.border = {
        top:    { style: 'thin' },
        left:   { style: 'thin' },
        bottom: { style: 'thin' },
        right:  { style: 'thin' },
      };
    });

    // Add data rows with borders
    results.forEach(row => {
      const addedRow = worksheet.addRow(row);
      addedRow.eachCell(cell => {
        cell.border = {
          top:    { style: 'thin' },
          left:   { style: 'thin' },
          bottom: { style: 'thin' },
          right:  { style: 'thin' },
        };
      });
    });

    // Set headers to download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=consultations.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  });
});

// Search logics
app.get('/search-consultations', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  if (req.session.user.role !== 'admin' && req.session.user.role !== 'manager') 
    return res.status(403).send('Unauthorized');

  const search = req.query.query || '';

  const sql = `
    SELECT * FROM consultations
    WHERE
      LOWER(first_name) LIKE ? OR
      LOWER(last_name) LIKE ? OR
      LOWER(email) LIKE ? OR
      LOWER(phone) LIKE ? OR
      LOWER(company_org) LIKE ?
  `;

  const searchTerm = `%${search.toLowerCase()}%`;

  db.query(sql, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// GET all users and group them by role
app.get('/admin/users', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const role = req.session.user.role;
  const username = req.session.user.username;

  // Only fetch users for admin and manager users
  if (role === 'admin' || role === 'manager') {
    db.query('SELECT * FROM users', (err, results) => {
      if (err) {
        console.error('Error fetching users:', err);
        return res.status(500).send('Server error');
      }

      // Separate by role
      const admins = results.filter(user => user.role === 'admin');
      const clients = results.filter(user => user.role === 'client');
      const managers = results.filter(user => user.role === 'manager');

      // Helper to get class based on first letter
      function getAvatarColor(name) {
        const firstLetter = name.charAt(0).toLowerCase();
        return 'avatar-' + firstLetter;
      }

      // Render appropriate template based on role
      const templatePath = role === 'admin' ? 
        'ejs/dashboard-admin/users' : 
        'ejs/dashboard-manager/users';

      res.render(templatePath, {
        username,
        role,
        consultations: results,
        getAvatarColor,
        totalConsultations: results.length,
        admins,
        clients,
        managers,
        totalAdmins: admins.length,
        totalClients: clients.length,
        totalManagers: managers.length,
        totalUsers: results.length
      });
    });
  } else {
    // For other users, render their dashboard
    res.render(`ejs/dashboard/dashboard-${role}`, {
      username,
      role
    });
  }
});

// Get user info by ID
app.get('/users/api/:id', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  
  // Allow both admin and manager to access user details
  if (req.session.user.role !== 'admin' && req.session.user.role !== 'manager') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove sensitive information before sending response
    const user = results[0];
    delete user.password;
    
    res.json(user);
  });
});

// Update user information
app.post('/users/update/:id', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Login required' });
  if (req.session.user.role !== 'admin' && req.session.user.role !== 'manager') 
    return res.status(403).json({ success: false, message: 'Unauthorized' });

  const { id } = req.params;
  const { username, email, role, password } = req.body;

  try {
    // Get current user data first
    db.query("SELECT * FROM users WHERE id = ?", [id], async (err, results) => {
      if (err) return res.status(500).json({ success: false, message: 'Error fetching user' });
      if (!results.length) return res.status(404).json({ success: false, message: 'User not found' });

      const currentUser = results[0];

      // Check if nothing changed
      const isSameUsername = username === currentUser.username;
      const isSameEmail = email === currentUser.email;
      const isSameRole = role === currentUser.role;
      const noPasswordChange = !password;

      if (isSameUsername && isSameEmail && isSameRole && noPasswordChange) {
        // Nothing to update → send JSON response
        return res.json({ success: false, message: "Make a change to update" });
      }

      // Build update query
      let query, params;

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        query = `UPDATE users SET username=?, email=?, role=?, password=? WHERE id=?`;
        params = [username, email, role, hashedPassword, id];
      } else {
        query = `UPDATE users SET username=?, email=?, role=? WHERE id=?`;
        params = [username, email, role, id];
      }

      db.query(query, params, (err2) => {
        if (err2) {
          console.log(err2);
          return res.status(500).json({ success: false, message: 'Error updating user' });
        }

        // Update successful → redirect as before
        res.redirect('/admin/users');
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: 'Error processing request' });
  }
});


// Delete user
app.delete('/users/delete/:id', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  if (req.session.user.role !== 'admin' && req.session.user.role !== 'manager') 
    return res.status(403).send('Unauthorized');

  const id = req.params.id;
  db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).send('Failed to delete user');
    res.sendStatus(200);
  });
});

// Export users by role
app.get('/export/users/:role', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  if (req.session.user.role !== 'admin' && req.session.user.role !== 'manager') 
    return res.status(403).send('Unauthorized');

  const roleToExport = req.params.role;
  const validRoles = ['admin', 'client', 'manager', 'all'];
  
  if (!validRoles.includes(roleToExport)) {
    return res.status(400).send('Invalid role specified');
  }

  // Build query based on role
  const query = roleToExport === 'all' 
    ? 'SELECT * FROM users'
    : 'SELECT * FROM users WHERE role = ?';
  
  const queryParams = roleToExport === 'all' ? [] : [roleToExport];

  db.query(query, queryParams, async (err, results) => {
    if (err) return res.status(500).send("Database error");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${roleToExport.charAt(0).toUpperCase() + roleToExport.slice(1)} Users`);

    // Define columns
    worksheet.columns = [
      { header: 'Username', key: 'username', width: 20, transform: value => value.charAt(0).toUpperCase() + value.slice(1) },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Role', key: 'role', width: 15, transform: value => value.toUpperCase() }
    ];

    // Add header row styling
    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add data rows with borders
    results.forEach(row => {
      // Remove sensitive data
      delete row.password;
      
      const addedRow = worksheet.addRow(row);
      addedRow.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Set headers for download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=users-${roleToExport}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  });
});

// Search logics for users
app.get('/search-users', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  if (req.session.user.role !== 'admin' && req.session.user.role !== 'manager') 
    return res.status(403).send('Unauthorized');

  const search = req.query.query || '';

  const sql = `
    SELECT * FROM users 
    WHERE
      LOWER(username) LIKE ? OR
      LOWER(email) LIKE ? OR
      LOWER(role) LIKE ?
  `;

  const searchTerm = `%${search.toLowerCase()}%`;

  db.query(sql, [searchTerm, searchTerm, searchTerm], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    // Remove sensitive information before sending response
    const sanitizedResults = results.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json(sanitizedResults);
  });
});












// Get all consultations (Requests page)
app.get('/requests', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const role = req.session.user.role;
  const username = req.session.user.username;

  if (!['admin', 'manager'].includes(role)) {
    return res.redirect('/dashboard');
  }

  const sql = "SELECT * FROM consultations ORDER BY submitted_at DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send("Internal Server Error");

    // Count each status
    const totalConsultations = results.length;
    const totalPending = results.filter(r => r.status?.toLowerCase() === 'pending').length;
    const totalApproved = results.filter(r => r.status?.toLowerCase() === 'approved').length;
    const totalDismissed = results.filter(r => r.status?.toLowerCase() === 'dismissed').length;

    function getAvatarColor(name) {
      const firstLetter = name.charAt(0).toLowerCase();
      return 'avatar-' + firstLetter;
    }

    res.render('ejs/dashboard-admin/requests', {
      username,
      role,
      consultations: results,
      getAvatarColor,
      totalConsultations,
      totalPending,
      totalApproved,
      totalDismissed
    });
  });
});


// Approve / Dismiss consultation
app.post('/requests/action/:id', async (req, res) => {
  try {
    if (!req.session.user) 
      return res.status(401).json({ success: false, message: 'Unauthorized' });

    if (!['admin', 'manager'].includes(req.session.user.role)) 
      return res.status(403).json({ success: false, message: 'Forbidden' });

    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'dismiss'

    const validActions = ['approve', 'dismiss'];
    if (!validActions.includes(action)) 
      return res.status(400).json({ success: false, message: 'Invalid action' });

    // Fetch consultation
    db.query('SELECT * FROM consultations WHERE id = ?', [id], async (err, results) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error' });
      if (results.length === 0) return res.status(404).json({ success: false, message: 'Consultation not found' });

      const consultation = results[0];
      const newStatus = action === 'approve' ? 'approved' : 'dismissed'; // lowercase to match ENUM or varchar

      // Update consultation status
      db.query('UPDATE consultations SET status = ? WHERE id = ?', [newStatus, id], async (err) => {
        if (err) {
          console.log('DB update error:', err);
          return res.status(500).json({ success: false, message: 'Error updating consultation' });
        }

        // Send email
        try {
          const mailOptions = {
            from: '"HOBUCO" <mugishatumusifuchretien@gmail.com>',
            to: consultation.email,
            subject: `Consultation ${newStatus}`,
            text: `Dear ${consultation.first_name},

We hope this email finds you well. We wanted to inform you that your consultation request has been ${newStatus}.

Status: ${newStatus.toUpperCase()}
Date Updated: ${new Date().toLocaleDateString()}

If you have any questions about this update, please don't hesitate to contact our support team at hobucoltd2050@gmail.com.

Best regards,
HOBUCO Consulting Team

Note: This is notifying message, please do not reply directly to this email.`
          };

          await transporter.sendMail(mailOptions);
        } catch (e) {
          console.log('Email error:', e);
        }

        res.json({ success: true, message: `Consultation ${newStatus}` });
      });
    });

  } catch (error) {
    console.log('Unexpected error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});















// Route to view logged-in user's consultations (clients only)
app.get('/client', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  if (req.session.user.role !== 'client') return res.redirect('/dashboard');

  const userEmail = req.session.user.email;
  const role = req.session.user.role;

  const sql = `
    SELECT * FROM consultations 
    WHERE LOWER(email) = LOWER(?) 
    ORDER BY submitted_at DESC
  `;

  db.query(sql, [userEmail], (err, results) => {
    if (err) {
      console.error('Error fetching consultations:', err);
      return res.status(500).send('Server error');
    }

    // ✅ Count totals by status
    let totalConsultations = results.length;
    let pendingCount = results.filter(r => r.status === 'pending').length;
    let approvedCount = results.filter(r => r.status === 'approved').length;
    let dismissedCount = results.filter(r => r.status === 'dismissed').length;

    // Avatar function for client dashboard
    function getAvatarColor(name) {
      if (!name || name.length === 0) return 'avatar-default';
      return 'avatar-' + name.charAt(0).toLowerCase();
    }

    res.render('ejs/dashboard/dashboard-client', {
      consultations: results,
      username: req.session.user.username,
      role,
      getAvatarColor,
      totalConsultations,
      pendingCount,
      approvedCount,
      dismissedCount
    });
  });
});
















// help
app.get('/help', (req, res) => {
  res.render('ejs/dashboard/help');

});







// Start server
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));


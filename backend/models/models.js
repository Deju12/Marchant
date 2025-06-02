export async function createTables(db) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS merchants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      merchant_name VARCHAR(255) NOT NULL,
      phone_number VARCHAR(20) NOT NULL UNIQUE,
      email VARCHAR(255),
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS employee (
      id INT AUTO_INCREMENT PRIMARY KEY,
      merchant_id INT,
      phone_number VARCHAR(20) NOT NULL UNIQUE,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  merchant_id INT NULL,
  employee_id INT NULL,
  otp_code VARCHAR(10) NOT NULL,
  otp_type ENUM('activation', 'deactivation'),
  is_used BOOLEAN DEFAULT false,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE
);
  `);
  

  await db.execute(`
    CREATE TABLE IF NOT EXISTS pins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT,
      pin_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      merchant_id INT,
      transaction_type VARCHAR(50),
      amount DECIMAL(10, 2),
      currency VARCHAR(10),
      status ENUM('success', 'pending', 'failed'),
      transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS device_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT,
      device_info TEXT,
      last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_logged_in BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS pin_change_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT,
      changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS deactivation_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT,
      requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      otp_sent BOOLEAN DEFAULT false,
      confirmed BOOLEAN DEFAULT false,
      completed_at TIMESTAMP NULL DEFAULT NULL,
      FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE
    );
  `);

  console.log("✅ All tables created from models.js");
}

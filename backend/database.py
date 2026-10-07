import pymysql
import pymysql.cursors
from datetime import datetime
from config import Config
from werkzeug.security import generate_password_hash

def get_db_connection(include_db=True):
    """
    Establishes and returns a connection to MySQL database using credentials from Config.
    """
    return pymysql.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME if include_db else None,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True,
        charset='utf8mb4'
    )

def query_db(query, args=(), one=False):
    """
    Executes a SELECT query and returns the results.
    """
    conn = get_db_connection(include_db=True)
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, args)
            results = cursor.fetchall()
            return (results[0] if results else None) if one else results
    finally:
        conn.close()

def execute_db(query, args=()):
    """
    Executes an INSERT, UPDATE, or DELETE query and returns lastrowid.
    """
    conn = get_db_connection(include_db=True)
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, args)
            conn.commit()
            return cursor.lastrowid
    finally:
        conn.close()

def init_db():
    """
    Initializes the database and tables if they don't exist, and seeds initial data without deleting existing data.
    """
    # 1. Connect to MySQL server and ensure database exists
    try:
        conn = get_db_connection(include_db=False)
        with conn.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{Config.DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        conn.close()
    except pymysql.err.OperationalError as e:
        if e.args[0] == 1045:
            print("[Database Notice] MySQL Access Denied for user 'root'@'localhost'.")
            print(" -> If your MySQL root account requires a password, please specify DB_PASSWORD in backend/.env")
            return False
        else:
            print(f"[Database Notice] Could not connect to MySQL server: {e}")
            return False
    except Exception as e:
        print(f"[Database Notice] Database initialization notice: {e}")
        return False

    # 2. Connect to the database and ensure tables exist
    try:
        conn = get_db_connection(include_db=True)
        with conn.cursor() as cursor:
            # Create users table if not exists
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS `users` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `username` VARCHAR(100) NOT NULL UNIQUE,
                    `email` VARCHAR(191) NOT NULL UNIQUE,
                    `password` VARCHAR(255) NOT NULL,
                    `name` VARCHAR(150) NOT NULL,
                    `role` VARCHAR(100) DEFAULT 'Client / User',
                    `initials` VARCHAR(10) DEFAULT '',
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)

            # Create complaints table if not exists
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS `complaints` (
                    `id` VARCHAR(50) PRIMARY KEY,
                    `user` VARCHAR(150) NOT NULL,
                    `user_id` INT NULL,
                    `title` VARCHAR(255) NOT NULL,
                    `description` TEXT NOT NULL,
                    `category` VARCHAR(100) NOT NULL,
                    `priority` VARCHAR(50) NOT NULL,
                    `confidence` INT NOT NULL,
                    `status` VARCHAR(50) DEFAULT 'Pending',
                    `attachment` VARCHAR(255) NULL,
                    `date` VARCHAR(50) NOT NULL,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX `idx_category` (`category`),
                    INDEX `idx_status` (`status`),
                    INDEX `idx_priority` (`priority`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)

            # Ensure all required columns exist in complaints table (handles upgrades from older schemas)
            cursor.execute("DESCRIBE `complaints`")
            existing_cols = {row["Field"].lower(): row for row in cursor.fetchall()}

            if "id" in existing_cols and "int" in existing_cols["id"]["Type"].lower():
                # Modify id column from INT to VARCHAR(50)
                try:
                    cursor.execute("ALTER TABLE `complaints` MODIFY `id` VARCHAR(50) NOT NULL;")
                except Exception as e:
                    print(f"[Database Migration] Notice modifying id column: {e}")

            if "user" not in existing_cols:
                cursor.execute("ALTER TABLE `complaints` ADD COLUMN `user` VARCHAR(150) NOT NULL DEFAULT 'Anonymous' AFTER `id`;")
            if "user_id" not in existing_cols:
                cursor.execute("ALTER TABLE `complaints` ADD COLUMN `user_id` INT NULL AFTER `user`;")
            if "attachment" not in existing_cols:
                cursor.execute("ALTER TABLE `complaints` ADD COLUMN `attachment` VARCHAR(255) NULL AFTER `status`;")
            if "date" not in existing_cols:
                cursor.execute("ALTER TABLE `complaints` ADD COLUMN `date` VARCHAR(50) NOT NULL DEFAULT '' AFTER `attachment`;")

            # Seed demo users if empty
            cursor.execute("SELECT COUNT(*) AS count FROM `users`")
            user_count = cursor.fetchone()["count"]
            if user_count == 0:
                demo_users = [
                    (
                        "admin",
                        "admin@complainai.com",
                        generate_password_hash("admin123"),
                        "Alex Smith",
                        "Administrator",
                        "AS"
                    ),
                    (
                        "alex",
                        "alex.smith@complainai.com",
                        generate_password_hash("password123"),
                        "Alex Smith",
                        "Administrator",
                        "AS"
                    ),
                    (
                        "support",
                        "support@complainai.com",
                        generate_password_hash("support123"),
                        "Sarah Jenkins",
                        "Support Specialist",
                        "SJ"
                    ),
                ]
                cursor.executemany("""
                    INSERT INTO `users` (`username`, `email`, `password`, `name`, `role`, `initials`)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, demo_users)
                print("[Database] Seeded demo users successfully.")

            # Seed initial complaints if empty
            cursor.execute("SELECT COUNT(*) AS count FROM `complaints`")
            complaint_count = cursor.fetchone()["count"]
            if complaint_count == 0:
                demo_complaints = [
                    (
                        "CMP-1001",
                        "Aarav Sharma",
                        "Unauthorized transaction detected",
                        "I noticed an unauthorized transaction on my account.",
                        "Fraud/Security",
                        "High",
                        96,
                        "Pending",
                        "23 Sep 2026"
                    ),
                    (
                        "CMP-1002",
                        "Priya Patel",
                        "Double charged for order",
                        "My payment was charged twice for the same order.",
                        "Billing",
                        "High",
                        94,
                        "Resolved",
                        "22 Sep 2026"
                    ),
                    (
                        "CMP-1003",
                        "Rohan Mehta",
                        "Application crashes upon login",
                        "The application keeps crashing when I login.",
                        "Technical Issues",
                        "Medium",
                        91,
                        "In Progress",
                        "21 Sep 2026"
                    ),
                    (
                        "CMP-1004",
                        "Neha Singh",
                        "Package not delivered",
                        "My delivery has not arrived yet.",
                        "Delivery",
                        "Medium",
                        89,
                        "Pending",
                        "20 Sep 2026"
                    ),
                    (
                        "CMP-1005",
                        "Vikram Joshi",
                        "Unable to change phone number",
                        "I cannot update my registered phone number.",
                        "Account",
                        "Low",
                        93,
                        "Resolved",
                        "19 Sep 2026"
                    ),
                    (
                        "CMP-1006",
                        "Sneha Kapoor",
                        "Damaged package received",
                        "The product I received is damaged.",
                        "Product/Service",
                        "High",
                        95,
                        "Pending",
                        "18 Sep 2026"
                    )
                ]
                cursor.executemany("""
                    INSERT INTO `complaints` (`id`, `user`, `title`, `description`, `category`, `priority`, `confidence`, `status`, `date`)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, demo_complaints)
                print("[Database] Seeded initial complaints successfully.")

            conn.commit()
            print("[Database] MySQL Database and tables connected & verified.")
            return True
    except Exception as e:
        print(f"[Database Notice] Table verification notice: {e}")
        return False
    finally:
        if 'conn' in locals() and conn:
            conn.close()

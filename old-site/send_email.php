<?php
// Load PHPMailer library
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require 'vendor/autoload.php';

$mail = new PHPMailer(true);

try {
    // SMTP server configuration
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'dharshinibhavana26741@gmail.com'; // Your Gmail
    $mail->Password = '9791559741';       // Use Gmail App Password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    // Sender and recipient settings
    $mail->setFrom('dharshubhavana2628@gmail.com', 'Dharshu Bhavana');  // Sender name
    $mail->addAddress('recipient@example.com', 'Receiver Name');        // Replace with receiver's email

    // Email content
    $mail->isHTML(true);
    $mail->Subject = 'Test Mail from PHPMailer';
    $mail->Body    = 'Hello, this is a test email sent from PHPMailer using Gmail SMTP.';

    // Send email
    $mail->send();
    echo 'Email has been sent successfully.';
} catch (Exception $e) {
    echo "Email could not be sent. Mailer Error: {$mail->ErrorInfo}";
}
?>

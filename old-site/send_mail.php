<?php
// Include the PHPMailer class
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';
require 'PHPMailer/Exception.php';

// Create a new PHPMailer instance
$mail = new PHPMailer\PHPMailer\PHPMailer();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Capture form data
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $phone = htmlspecialchars($_POST['phone']);
    $message = htmlspecialchars($_POST['message']);

    // Email addresses to send the form data to
    $to = "info@rdcollege.in, drkveerakumar@gmail.com"; // comma-separated
    $subject = "New Admission Enquiry from $name";

    // Construct the email body
    $body = "You have received a new enquiry:\n\n";
    $body .= "Name: $name\n";
    $body .= "Email: $email\n";
    $body .= "Phone: $phone\n";
    $body .= "Message: \n$message\n";

    try {
        //Server settings
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';  // Set the SMTP server to Gmail
        $mail->SMTPAuth = true;
        $mail->Username = 'your-email@gmail.com';  // Your Gmail address
        $mail->Password = 'your-email-password';  // Your Gmail password (or app password if 2FA enabled)
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        // Recipients
        $mail->setFrom('your-email@gmail.com', 'RD National College');
        $mail->addAddress($to);

        // Content
        $mail->isHTML(false);
        $mail->Subject = $subject;
        $mail->Body    = $body;

        // Send the email
        if ($mail->send()) {
            echo "<script>alert('Your enquiry has been sent successfully. We will get back to you soon.'); window.location.href = 'thankyou.html';</script>";
        } else {
            echo "<script>alert('There was an error sending your enquiry. Please try again later.'); window.location.href = 'contact.html';</script>";
        }
    } catch (Exception $e) {
        echo "Mailer Error: {$mail->ErrorInfo}";
    }
}
?>

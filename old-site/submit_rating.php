<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $rating = $_POST['rating'];
    $to = "dharshinibhavana2628@gmail.com";
    $subject = "New Star Rating Received";
    $message = "Someone gave a rating of " . $rating . " stars!";
    $headers = "From: noreply@yourdomain.com";

    if (mail($to, $subject, $message, $headers)) {
        echo "Thanks! Your rating was submitted.";
    } else {
        echo "Error sending email.";
    }
} else {
    echo "Invalid request.";
}
?>

<?php
// Include Composer's autoloader
require 'vendor/autoload.php';

// Import Twilio SDK
use Twilio\Rest\Client;

// Twilio credentials (replace these with your actual credentials)
$sid = 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; // Replace with your Twilio Account SID
$token = 'your_auth_token'; // Replace with your Twilio Auth Token
$twilio_number = '+1234567890'; // Replace with your Twilio phone number
$to_number = '+917639278619'; // Your mobile number

// Check if the rating was sent from the frontend
if (isset($_POST['rating'])) {
    $rating = $_POST['rating'];

    // Initialize the Twilio client
    $client = new Client($sid, $token);

    try {
        // Send an SMS to your mobile number with the rating
        $message = $client->messages->create(
            $to_number, // The number to send the message to
            [
                'from' => $twilio_number, // The Twilio number you purchased
                'body' => 'New Rating Received: ' . $rating . ' star(s)' // The message content
            ]
        );
        echo 'Rating received. SMS sent successfully.';
    } catch (Exception $e) {
        echo 'Error: ' . $e->getMessage();
    }
} else {
    echo 'No rating received.';
}
?>

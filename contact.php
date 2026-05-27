<?php
// Contact form handler for rockypointremodeling.com
// Emails submissions to the business inbox. No third-party service.
// Sends From an authenticated/DKIM-signed neonframewebdesign.com address for
// deliverability (the bare domain has no mail records), Reply-To the visitor.

$RECIPIENT  = 'rockypointremodeling1@gmail.com';
$FROM_ADDR  = 'noreply@neonframewebdesign.com';
$FROM_NAME  = 'Rocky Point Remodeling Website';

$wantsJson = stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

function respond($ok, $error, $wantsJson) {
    if ($wantsJson) {
        header('Content-Type: application/json; charset=utf-8');
        if (!$ok) http_response_code(422);
        echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error]);
    } else {
        header('Location: contact.html' . ($ok ? '?sent=1' : '?error=1'));
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(false, 'Method not allowed.', $wantsJson);
}

// Honeypot: real users never fill this hidden field. Pretend success, drop it.
if (!empty($_POST['_honey'])) {
    respond(true, '', $wantsJson);
}

$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$phone   = trim($_POST['phone'] ?? '');
$ptype   = trim($_POST['project_type'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Please provide a valid name and email address.', $wantsJson);
}

// Strip CR/LF from anything that lands in a header (prevents header injection)
$safeName  = preg_replace('/[\r\n]+/', ' ', $name);
$safeEmail = preg_replace('/[\r\n]+/', '', $email);

$subject = 'New website inquiry from ' . $safeName;

$body  = "New contact form submission from rockypointremodeling.com\r\n\r\n";
$body .= "Name:    " . $name . "\r\n";
$body .= "Email:   " . $email . "\r\n";
$body .= "Phone:   " . ($phone !== '' ? $phone : '(not provided)') . "\r\n";
$body .= "Project: " . ($ptype !== '' ? $ptype : '(not specified)') . "\r\n\r\n";
$body .= "Message:\r\n" . ($message !== '' ? $message : '(no message)') . "\r\n\r\n";
$body .= "----\r\n";
$body .= "Sent " . date('Y-m-d H:i:s T') . " from the website contact form.\r\n";
$body .= "Just hit Reply to respond directly to " . $safeName . ".\r\n";

$headers  = 'From: ' . $FROM_NAME . ' <' . $FROM_ADDR . ">\r\n";
$headers .= 'Reply-To: ' . $safeName . ' <' . $safeEmail . ">\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: RPR-ContactForm\r\n";

$sent = @mail($RECIPIENT, $subject, $body, $headers, '-f ' . $FROM_ADDR);

respond((bool)$sent, 'Sorry, the message could not be sent. Please call (602) 312-0400.', $wantsJson);

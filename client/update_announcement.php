<?php 

$requestMethod = $_SERVER['REQUEST_METHOD'];

if($requestMethod != 'PUT') {
    http_response_code(400);
} else {
    $data = json_decode(file_get_contents('php://input'));
    $date = new DateTime($data->date);
    $status = $data->status;
    $hide_from_page = $data->hide_from_page;

    $month_str = $date->format('F');
    $day_ordinal = $date->format('jS');
    $time = $date->format('g:ia');

    // $f = new NumberFormatter('en', NumberFormatter::ORDINAL);
    // $day_str_ordinal = $f->format($date->format('j'));

    $html = fopen('../announce.html', 'w') or die('Unable to open announce html file.');
    $xml = fopen('../announce.xml', 'w') or die('Unable to open announce xml file.');

    if ($hide_from_page) {
        fwrite($html, "");
    } else if ($status == 0) { // Undecided
        fwrite($html, "<div style=\"font-size: 200%; background-color: yellow;\">$month_str $day_ordinal Public Astronomy Night Status: Not decided yet. Check again later.</div>");
    } else if($status == 1) { // canceled
        fwrite($html, "<div style=\"font-size: 200%; background-color: red;\">$month_str $day_ordinal Public Astronomy Night Status: Canceled because of clouds, hope to see you next time.</div>");
    } else if($status == 2) { // happening
        fwrite($html, "<div style=\"font-size: 200%; background-color: green;\">$month_str $day_ordinal Public Astronomy Night Status: Will be held and starts at $time. Hope you can make it.</div>");
    }
    fclose($html);

    fwrite($xml, "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
    fwrite($xml, "<Response>");
    fwrite($xml, "<Say voice=\"woman\">");
    if ($status == 0) { // Undecided
        fwrite($xml, "The public astronomy night on $month_str $day_ordinal has not be decided on yet, please check again later.");
    } else if($status == 1) { // canceled
        fwrite($xml, "The public astronomy night on $month_str $day_ordinal has been canceled because of clouds.");
    } else if($status == 2) { // happening
        fwrite($xml, "The public astronomy night on $month_str $day_ordinal will be held and starts at $time. Hope you can make it.");
    }
    fwrite($xml, "</Say>");
    fwrite($xml, "<Pause length=\"1\"/>");
    fwrite($xml, "<Say voice=\"woman\">");
    fwrite($xml, "You may hang up or stay on the line to be forwarded to Farpoint Observatory.");
    fwrite($xml, "</Say>");
    fwrite($xml, "<Pause length=\"3\"/>");
    fwrite($xml, "<Dial>785-203-8077</Dial>");
    fwrite($xml, "</Response>\n");
    fclose($xml);
}
?>

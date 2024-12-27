<?
namespace Zippy_booking\Src\Controllers\Mail;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;

defined('ABSPATH') or die();
class Zippy_Booking_Mail_Controller
{
    public static function send_mail(WP_REST_Request $request){

        try {
            $required_fields = [
                "subject" => ["required" => true, "data_type" => "string"],
                "content" => ["required" => true, "data_type" => "string"],
                "customer_email" => ["required" => true, "data_type" => "email"]
            ];
            
            // Validate Request Fields
            $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
            if(!empty($validate)){
                return Zippy_Response_Handler::error($validate);
            }
    
    
            $sender_name = get_bloginfo('name');
            $subject = sanitize_text_field($request["subject"]);
            $content = $request["content"];
            $customer_email = sanitize_text_field($request["customer_email"]);
    
            global $wpdb;
            $table_name     = ZIPPY_BOOKING_CONFIG_TABLE_NAME;
            $query = "SELECT store_email FROM $table_name WHERE 1=1";
            $store_email = $wpdb->get_results($query);
            $store_email = !empty($store_email) ? $store_email[0]->store_email : get_bloginfo('admin_email');
            $headers = [
                "Content-Type: text/html; charset=UTF-8",
                "From: $sender_name <$store_email>",
            ];
    
            if (wp_mail($customer_email, $subject, $content, $headers)) {
                return Zippy_Response_Handler::success([
                    "subject" => $subject,
                    "content" => $content,
                    "customer_email" => $customer_email,
                ]);
            } else {
                return Zippy_Response_Handler::error(ZIPPY_BOOKING_ERROR);
            }
        } catch (Exception $e) {
            return Zippy_Response_Handler::error($e->getMessage());
        }
        
    }
}

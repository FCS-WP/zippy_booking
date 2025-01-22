<?php

/**
 * API ResponHandler
 *
 * @package Shin
 */

namespace Zippy_Booking\Src\Controllers\Web\Supports;

use WP_REST_Request;

use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_booking\Src\App\Models\Zippy_Log_Action;
use Zippy_Booking\Src\Controllers\Web\Supports\Zippy_Booking_Support_Category_Controller;

defined('ABSPATH') or die();

class Zippy_Booking_Support_Products_Controller
{

    public static function handle_support_booking_product(WP_REST_Request $request)
    {
        global $wpdb;


        $items_id = $request->get_param('items_id');
        $mapping_type = $request["request"]['mapping_type'];
        if (empty($items_id)) {
            return Zippy_Response_Handler::error('Items ID is required.');
        }

        $table_name = $wpdb->prefix . 'products_booking';

        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$table_name} WHERE items_id = %d AND mapping_status = %s",
            $items_id,
            'include'
        ));

        if ($exists > 0) {
            return Zippy_Response_Handler::error('Items ID already exists.');
        }

        $product = wc_get_product($items_id);

        if (!$product) {
            return Zippy_Response_Handler::error('Product not found.');
        }

        $product_name = $product->get_name();
        $product_price = $product->get_price();

        $result = $wpdb->insert(
            $table_name,
            array(
                'items_id' => $items_id,
                'mapping_type' => $mapping_type,
                'mapping_status' => 'include',
            ),
            array(
                '%d',
                '%s',
                '%s',
            )
        );

        if ($result === false) {
            return Zippy_Response_Handler::error('Error inserting data into the database.');
        }

        // $meta_key = 'product_booking_mapping';
        // $meta_value = array(
        //     'items_id' => $items_id,
        //     'mapping_type' => $mapping_type,
        //     'product_name' => $product_name,
        //     'product_price' => $product_price
        // );

        // $update_meta = update_post_meta($items_id, $meta_key, $meta_value);

        // if (!$update_meta) {
        //     return Zippy_Response_Handler::error('Failed to add meta to the product.');
        // }

        $added_item = array(
            'items_id' => $items_id,
            'mapping_type' => $mapping_type,
            'product_name' => $product_name,
            'product_price' => $product_price,
            // 'meta_key' => $meta_key,
        );

        return Zippy_Response_Handler::success($added_item, 'Product booking mapping created successfully.');
    }

    public static function handle_support_booking_products(WP_REST_Request $request)
    {
        global $wpdb;

        $products = $request->get_param('products');

        if (empty($products) || !is_array($products)) {
            return Zippy_Response_Handler::error('Products array is required and must be an array.');
        }

        $table_name = $wpdb->prefix . 'products_booking';

        $added_items = [];
        $duplicate_items = [];
        $invalid_items = [];

        foreach ($products as $product) {
            $items_id = isset($product['items_id']) ? intval($product['items_id']) : null;
            $mapping_type = isset($product['mapping_type']) ? sanitize_text_field($product['mapping_type']) : null;

            // Validate individual product
            if (!$items_id || !$mapping_type) {
                $invalid_items[] = $product;
                continue;
            }

            // Check existence in one query
            $existing_data = $wpdb->get_row($wpdb->prepare(
                "SELECT id, mapping_status FROM {$table_name} WHERE items_id = %d",
                $items_id
            ));

            if ($existing_data && $existing_data->mapping_status === 'include') {
                $duplicate_items[] = array(
                    'items_id' => $items_id,
                    'mapping_type' => $mapping_type,
                );
                continue;
            }

            // Fetch product details
            $product_data = wc_get_product($items_id);
            if (!$product_data) {
                $invalid_items[] = $product;
                continue;
            }

            $product_name = $product_data->get_name();
            $product_price = $product_data->get_price();

            // Insert or update database entry
            if ($existing_data && $existing_data->mapping_status === 'exclude') {
                $result = $wpdb->update(
                    $table_name,
                    array(
                        'mapping_type' => $mapping_type,
                        'mapping_status' => 'include'
                    ),
                    array('id' => $existing_data->id),
                    array('%s', '%s'),
                    array('%d')
                );
            } else {
                $result = $wpdb->insert(
                    $table_name,
                    array(
                        'items_id' => $items_id,
                        'mapping_type' => $mapping_type,
                        'mapping_status' => 'include'
                    ),
                    array('%d', '%s', '%s')
                );
            }

            if ($result === false) {
                error_log("Database error: {$wpdb->last_error}");
                continue; // Skip on database errors
            }

            $added_items[] = array(
                'items_id' => $items_id,
                'mapping_type' => $mapping_type,
                'product_name' => $product_name,
                'product_price' => $product_price,
            );
        }

        // Build response
        if (empty($added_items) && !empty($duplicate_items)) {
            return Zippy_Response_Handler::error('All provided items already exist in the database.', $duplicate_items);
        }

        if (empty($added_items) && empty($duplicate_items) && !empty($invalid_items)) {
            return Zippy_Response_Handler::error('No valid items were added to the database. Some items were invalid.', $invalid_items);
        }

        return Zippy_Response_Handler::success(
            array(
                'added_items' => $added_items,
                'duplicate_items' => $duplicate_items,
                'invalid_items' => $invalid_items,
            ),
            'Items booking mappings processed successfully.'
        );
    }


    public static function get_all_support_booking_items(WP_REST_Request $request)
    {
        global $wpdb;

        $table_name = $wpdb->prefix . 'products_booking';

        try {
            // Rules
            $required_fields = [
                "category" => ["required" => false, "data_type" => "number"]
            ];

            // Validate Request Fields
            $validate = Zippy_Request_Validation::validate_request($required_fields, $request);

            if (!empty($validate)) {
                return Zippy_Response_Handler::error($validate);
            }

            $category_param = $request->get_param('category');

            if (!empty($category_param)) {
                $data = Zippy_Booking_Support_Category_Controller::get_support_product_by_category($category_param);
                return Zippy_Response_Handler::success($data, 'Items retrieved successfully.');
            }

            $items = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT items_id, mapping_type FROM {$table_name} WHERE mapping_status = 'include' ORDER BY CASE WHEN mapping_type = 'category' THEN 1 ELSE 2 END",
                ),
                ARRAY_A
            );


            if (empty($items)) {
                return Zippy_Response_Handler::error('No items found in the database.');
            }

            $items_suport_booking = [];
            foreach ($items as $item) {
                if ($item['mapping_type'] == 'product') {
                    $product = wc_get_product($item['items_id']);

                    if ($product) {
                        $item['item_name'] = $product->get_name();
                        $item['item_price'] = $product->get_price();
                        $item['item_extra_price'] = get_post_meta($product->get_id(), '_extra_price', true);
                    }
                } else {

                    $category = get_the_category_by_ID($item['items_id']);

                    if ($category) {
                        $item['item_name'] = $category;
                    }
                }

                $items_suport_booking[] = $item;
            }

            if (empty($items_suport_booking)) return Zippy_Response_Handler::success(array(), 'Products Support Not Found.');


            return Zippy_Response_Handler::success($items_suport_booking, 'Items retrieved successfully.');
        } catch (Exception $e) {
            return Zippy_Response_Handler::error($e->getMessage());
        }
    }
    public static function delete_support_booking(WP_REST_Request $request)
    {
        $required_fields = [
            'items_id' => ['required' => true, 'data_type' => 'number'],
            'type' => ['required' => true, 'data_type' => 'range', 'allowed_values' => ['product', 'category']],
            'mapping_type' => ['required' => false, 'data_type' => 'string'],
        ];

        $request_body = $request["request"];

        if (empty($request_body)) {
            Zippy_Response_Handler::error('Request body is required.');
        }

        foreach ($request["request"] as $req) {
            $validate = Zippy_Request_Validation::validate_request($required_fields, $req);
            if (!empty($validate)) {
                return Zippy_Response_Handler::error($validate);
            }
        }
        global $wpdb;

        $table_name = ZIPPY_BOOKING_PRODUCT_MAPPING_TABLE_NAME;
        if (!empty($request["request"][0]['is_product_in_sub'])) {

            try {
                $items_id = sanitize_text_field($request["request"][0]['items_id']);

                $type = sanitize_text_field($request["request"][0]['type']);

                $result = $wpdb->insert(
                    $table_name,
                    array(
                        'items_id' => $items_id,
                        "mapping_type" => $type,
                        'mapping_status' => 'exclude',
                    ),
                    array(
                        '%d',
                        '%s',
                        '%s',
                    )
                );

                $data = array(
                    "items_id" => $items_id,
                    "type" => $type,
                    "mapping_status" => 'exclude'
                );
                if ($result) {

                    return Zippy_Response_Handler::success($data);
                } else {
                    return Zippy_Response_Handler::error($data);
                }
            } catch (\Throwable $th) {
                $message = $th->getMessage();
                Zippy_Log_Action::log('delete_support_booking', json_encode($request), 'failure', $message);
                return Zippy_Response_Handler::error($message);
            }
        }

        try {


            $deleted_items = [];

            // Search if product/category exists in fcs_data_product_booking_mapping table or not
            foreach ($request_body as $body) {

                $item_id = $body["items_id"];
                $item_type = $body["type"];

                $sql = $wpdb->prepare(
                    "SELECT * FROM {$table_name} WHERE items_id = %d AND mapping_type = %s AND mapping_status = %s",
                    $body["items_id"],
                    $body["type"],
                    'include'
                );

                $count = count($wpdb->get_results($sql));

                if ($count < 1) {
                    return Zippy_Response_Handler::error("Item with items_id: $item_id and type: $item_type not found.");
                }
            }


            // Perform delete operation
            foreach ($request_body as $body) {
                $item_id = $body["items_id"];
                $item_type = $body["type"];

                $sql = $wpdb->prepare(
                    "DELETE FROM {$table_name} WHERE items_id = %d AND mapping_type = %s",
                    $body["items_id"],
                    $body["type"],
                );

                $result = $wpdb->query($sql);

                if ($result === false) {
                    Zippy_Log_Action::log('delete_support_booking', json_encode($request), 'failure', "Error deleting item with items_id: $item_id and type: $item_type.");
                    return Zippy_Response_Handler::error("Error deleting item with items_id: $item_id and type: $item_type.");
                }

                $deleted_items[] = $body;
            }

            Zippy_Log_Action::log('delete_support_booking', json_encode($deleted_items), 'Success', 'Success');
            return Zippy_Response_Handler::success($deleted_items);
        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('delete_support_booking', json_encode($request), 'failure', $message);
            return Zippy_Response_Handler::error($message);
        }
    }

    public static function update_product_price(WP_REST_Request $request)
    {
        $product_id = $request->get_param('product_id');
        $regular_price = $request->has_param('regular_price') ? $request->get_param('regular_price') : null;
        $extra_price = $request->has_param('extra_price') ? $request->get_param('extra_price') : null;

        if (!$product_id || $regular_price === null || $extra_price === null) {
            return Zippy_Response_Handler::error('Missing required parameters: product_id, regular_price, or extra_price.');
        }

        update_post_meta($product_id, '_price', $regular_price);
        update_post_meta($product_id, '_regular_price', $regular_price);
        update_post_meta($product_id, '_extra_price', $extra_price);

        return Zippy_Response_Handler::success(
            array(
                'product_id' => $product_id,
                'regular_price' => $regular_price,
                'extra_price' => $extra_price
            ),
            'Product price updated successfully.'
        );
    }
}

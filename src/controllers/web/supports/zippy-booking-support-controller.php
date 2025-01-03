<?php

/**
 * API ResponHandler
 *
 * @package Shin
 */

namespace Zippy_Booking\Src\Controllers\Web\Supports;

use WP_REST_Request;
use WP_Query;

use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;
use Zippy_booking\Src\App\Models\Zippy_Log_Action;


defined('ABSPATH') or die();

class Zippy_Booking_Support_Controller
{

    public static function handle_support_booking_product(WP_REST_Request $request)
    {
        global $wpdb;


        $items_id = $request->get_param('items_id');
        $mapping_type = $request->get_param('mapping_type');

        if (empty($items_id)) {
            return Zippy_Response_Handler::error('Items ID is required.');
        }

        $table_name = $wpdb->prefix . 'product_booking_mapping';

        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$table_name} WHERE items_id = %d",
            $items_id
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
            ),
            array(
                '%d',
                '%s',
            )
        );

        if ($result === false) {
            return Zippy_Response_Handler::error('Error inserting data into the database.');
        }

        $meta_key = 'product_booking_mapping';
        $meta_value = array(
            'items_id' => $items_id,
            'mapping_type' => $mapping_type,
            'product_name' => $product_name,
            'product_price' => $product_price
        );

        $update_meta = update_post_meta($items_id, $meta_key, $meta_value);

        if (!$update_meta) {
            return Zippy_Response_Handler::error('Failed to add meta to the product.');
        }

        $added_item = array(
            'items_id' => $items_id,
            'mapping_type' => $mapping_type,
            'product_name' => $product_name,
            'product_price' => $product_price,
            'meta_key' => $meta_key,
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

        $table_name = $wpdb->prefix . 'product_booking_mapping';

        $added_items = [];
        $duplicate_items = [];

        foreach ($products as $product) {
            $items_id = isset($product['items_id']) ? intval($product['items_id']) : null;
            $mapping_type = isset($product['mapping_type']) ? sanitize_text_field($product['mapping_type']) : null;

            if (!$items_id || !$mapping_type) {
                continue;
            }

            $exists = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM {$table_name} WHERE items_id = %d",
                $items_id
            ));

            if ($exists > 0) {
                $duplicate_items[] = array(
                    'items_id' => $items_id,
                    'mapping_type' => $mapping_type,
                );
                continue;
            }

            $product_data = wc_get_product($items_id);
            if (!$product_data) {
                continue; // Skip if product is not found
            }

            $product_name = $product_data->get_name();
            $product_price = $product_data->get_price();

            $result = $wpdb->insert(
                $table_name,
                array(
                    'items_id' => $items_id,
                    'mapping_type' => $mapping_type,
                ),
                array(
                    '%d',
                    '%s',
                )
            );

            if ($result !== false) {
                $added_items[] = array(
                    'items_id' => $items_id,
                    'mapping_type' => $mapping_type,
                    'product_name' => $product_name,
                    'product_price' => $product_price,
                );
            }
        }

        if (empty($added_items) && !empty($duplicate_items)) {
            return Zippy_Response_Handler::error('All provided items already exist in the database.', $duplicate_items);
        }

        if (empty($added_items)) {
            return Zippy_Response_Handler::error('No valid items were added to the database.');
        }

        return Zippy_Response_Handler::success(
            array(
                'added_items' => $added_items,
                'duplicate_items' => $duplicate_items,
            ),
            'Items booking mappings processed successfully.'
        );
    }

    public static function get_all_support_booking_items(WP_REST_Request $request)
    {
        global $wpdb;

        $table_name = $wpdb->prefix . 'product_booking_mapping';

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
                $data = self::get_support_product_by_category($category_param);
                return Zippy_Response_Handler::success($data, 'Items retrieved successfully.');
            }

            $items = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT items_id, mapping_type FROM {$table_name} ORDER BY CASE WHEN mapping_type = 'category' THEN 1 ELSE 2 END",
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

    public static function get_support_product_by_category($category)
    {
        $categories_data = [];

        $term = get_term($category, 'product_cat');
        $category_name = $term ? $term->name : 'Unknown Category';

        $subcategories = get_terms(array(
            'taxonomy' => 'product_cat',
            'parent' => $category,
            'hide_empty' => false,
        ));

        $subcategories_data = [];
        foreach ($subcategories as $subcategory) {
            $product_query = new WP_Query(array(
                'post_type' => 'product',
                'posts_per_page' => -1,
                'post_status' => 'publish',
                'tax_query' => array(
                    array(
                        'taxonomy' => 'product_cat',
                        'field' => 'id',
                        'terms' => $subcategory->term_id,
                    ),
                ),
            ));

            $subcategory_products = [];
            if ($product_query->have_posts()) {
                while ($product_query->have_posts()) {
                    $product_query->the_post();
                    $product_id = get_the_ID();
                    $product_name = get_the_title();
                    $product_price = get_post_meta($product_id, '_price', true);

                    $subcategory_products[] = array(
                        'product_id' => $product_id,
                        'product_name' => $product_name,
                        'product_price' => $product_price,
                    );
                }
                wp_reset_postdata();
            }

            $subcategories_data[] = array(
                'subcategory_id' => $subcategory->term_id,
                'subcategory_name' => $subcategory->name,
                'subcategory_products' => $subcategory_products,
            );
        }

        $category_data = array(
            'items_id' => $category,
            'mapping_type' => 'category',
            'category_name' => $category_name,
            'subcategories' => $subcategories_data,
        );

        if (empty($subcategories_data)) {
            $product_query = new WP_Query(array(
                'post_type' => 'product',
                'posts_per_page' => -1,
                'post_status' => 'publish',
                'tax_query' => array(
                    array(
                        'taxonomy' => 'product_cat',
                        'field' => 'id',
                        'terms' => $category,
                    ),
                ),
            ));

            $products_in_category = [];
            if ($product_query->have_posts()) {
                while ($product_query->have_posts()) {
                    $product_query->the_post();
                    $product_id = get_the_ID();
                    $product_name = get_the_title();
                    $product_price = get_post_meta($product_id, '_price', true);

                    $products_in_category[] = array(

                        'items_id' => $product_id,
                        'mapping_type' => 'product',
                        'item_name' => $product_name,
                        'item_price' => $product_price,
                    );
                }
                wp_reset_postdata();
            }

            $category_data = $products_in_category;
        }

        $categories_data = $category_data;

        return $categories_data;
    }

    public static function handle_support_booking_category(WP_REST_Request $request)
    {
        global $wpdb;

        $items_id = $request->get_param('items_id');
        $mapping_type = $request->get_param('mapping_type');

        if (empty($items_id) || $mapping_type !== 'category') {
            return Zippy_Response_Handler::error('Items ID is required and mapping type must be "category".');
        }

        $table_name = $wpdb->prefix . 'product_booking_mapping';

        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$table_name} WHERE items_id = %d AND mapping_type = %s",
            $items_id,
            $mapping_type
        ));

        if ($exists > 0) {
            return Zippy_Response_Handler::error('Items ID with this mapping type already exists.');
        }

        $result = $wpdb->insert(
            $table_name,
            array(
                'items_id' => $items_id,
                'mapping_type' => $mapping_type,
            ),
            array(
                '%d',
                '%s',
            )
        );

        if ($result === false) {
            return Zippy_Response_Handler::error('Error inserting data into the database.');
        }

        $term = get_term($items_id, 'product_cat');
        if (!$term || is_wp_error($term)) {
            return Zippy_Response_Handler::error('Invalid category ID or category not found.');
        }

        $category_name = $term->name;

        $product_query = new WP_Query(array(
            'post_type' => 'product',
            'posts_per_page' => -1,
            'post_status' => 'publish',
            'tax_query' => array(
                array(
                    'taxonomy' => 'product_cat',
                    'field' => 'id',
                    'terms' => $items_id,
                ),
            ),
        ));

        $products = [];
        if ($product_query->have_posts()) {
            while ($product_query->have_posts()) {
                $product_query->the_post();
                $product_id = get_the_ID();
                $product_name = get_the_title();
                $product_price = get_post_meta($product_id, '_price', true);

                $products[] = array(
                    'product_id' => $product_id,
                    'product_name' => $product_name,
                    'product_price' => $product_price,
                );
            }
            wp_reset_postdata();
        }

        $subcategories = get_terms(array(
            'taxonomy' => 'product_cat',
            'parent' => $items_id,
            'hide_empty' => false,
        ));

        $subcategory_data = [];
        if (!empty($subcategories) && !is_wp_error($subcategories)) {
            foreach ($subcategories as $subcategory) {
                $subcategory_query = new WP_Query(array(
                    'post_type' => 'product',
                    'posts_per_page' => -1,
                    'post_status' => 'publish',
                    'tax_query' => array(
                        array(
                            'taxonomy' => 'product_cat',
                            'field' => 'id',
                            'terms' => $subcategory->term_id,
                        ),
                    ),
                ));

                $subcategory_products = [];
                if ($subcategory_query->have_posts()) {
                    while ($subcategory_query->have_posts()) {
                        $subcategory_query->the_post();
                        $product_id = get_the_ID();
                        $product_name = get_the_title();
                        $product_price = get_post_meta($product_id, '_price', true);

                        $subcategory_products[] = array(
                            'product_id' => $product_id,
                            'product_name' => $product_name,
                            'product_price' => $product_price,
                        );
                    }
                    wp_reset_postdata();
                }

                if (!empty($subcategory_products)) {
                    $subcategory_data[] = array(
                        'subcategory_id' => $subcategory->term_id,
                        'subcategory_name' => $subcategory->name,
                        'subcategory_products' => $subcategory_products,
                    );
                }
            }
        }

        $response_data = array(
            'items_id' => $items_id,
            'mapping_type' => $mapping_type,
            'category_name' => $category_name,
        );

        if (empty($subcategory_data)) {
            if (!empty($products)) {
                $response_data['products_in_category'] = $products;
            } else {
                $response_data['products_in_category'] = [];
            }
        }

        if (!empty($subcategory_data)) {
            $response_data['subcategories'] = $subcategory_data;
        }

        return Zippy_Response_Handler::success($response_data, 'Category booking mapping created successfully.');
    }

    public static function handle_support_booking_categories(WP_REST_Request $request)
    {
        global $wpdb;

        $categories = $request->get_param('categories');

        if (empty($categories) || !is_array($categories)) {
            return Zippy_Response_Handler::error('Categories array is required and must be an array.');
        }

        $table_name = $wpdb->prefix . 'product_booking_mapping';

        $added_items = [];
        $duplicate_items = [];

        foreach ($categories as $category) {
            $items_id = isset($category['items_id']) ? intval($category['items_id']) : null;
            $mapping_type = isset($category['mapping_type']) ? sanitize_text_field($category['mapping_type']) : null;

            if (!$items_id || $mapping_type !== 'category') {
                continue;
            }

            $exists = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM {$table_name} WHERE items_id = %d AND mapping_type = %s",
                $items_id,
                $mapping_type
            ));

            if ($exists > 0) {
                $duplicate_items[] = array(
                    'items_id' => $items_id,
                    'mapping_type' => $mapping_type,
                );
                continue;
            }

            $result = $wpdb->insert(
                $table_name,
                array(
                    'items_id' => $items_id,
                    'mapping_type' => $mapping_type,
                ),
                array(
                    '%d',
                    '%s',
                )
            );

            if ($result !== false) {
                $term = get_term($items_id, 'product_cat');
                $category_name = $term ? $term->name : 'Unknown Category';

                $subcategories = get_terms(array(
                    'taxonomy' => 'product_cat',
                    'parent' => $items_id,
                    'hide_empty' => false,
                ));

                $subcategories_data = [];
                foreach ($subcategories as $subcategory) {
                    $product_query = new WP_Query(array(
                        'post_type' => 'product',
                        'posts_per_page' => -1,
                        'post_status' => 'publish',
                        'tax_query' => array(
                            array(
                                'taxonomy' => 'product_cat',
                                'field' => 'id',
                                'terms' => $subcategory->term_id,
                            ),
                        ),
                    ));

                    $subcategory_products = [];
                    if ($product_query->have_posts()) {
                        while ($product_query->have_posts()) {
                            $product_query->the_post();
                            $product_id = get_the_ID();
                            $product_name = get_the_title();
                            $product_price = get_post_meta($product_id, '_price', true);

                            $subcategory_products[] = array(
                                'product_id' => $product_id,
                                'product_name' => $product_name,
                                'product_price' => $product_price,
                            );
                        }
                        wp_reset_postdata();
                    }

                    $subcategories_data[] = array(
                        'subcategory_id' => $subcategory->term_id,
                        'subcategory_name' => $subcategory->name,
                        'subcategory_products' => $subcategory_products,
                    );
                }

                $category_data = array(
                    'items_id' => $items_id,
                    'mapping_type' => $mapping_type,
                    'category_name' => $category_name,
                    'subcategories' => $subcategories_data,
                );

                if (empty($subcategories_data)) {
                    $product_query = new WP_Query(array(
                        'post_type' => 'product',
                        'posts_per_page' => -1,
                        'post_status' => 'publish',
                        'tax_query' => array(
                            array(
                                'taxonomy' => 'product_cat',
                                'field' => 'id',
                                'terms' => $items_id,
                            ),
                        ),
                    ));

                    $products_in_category = [];
                    if ($product_query->have_posts()) {
                        while ($product_query->have_posts()) {
                            $product_query->the_post();
                            $product_id = get_the_ID();
                            $product_name = get_the_title();
                            $product_price = get_post_meta($product_id, '_price', true);

                            $products_in_category[] = array(
                                'product_id' => $product_id,
                                'product_name' => $product_name,
                                'product_price' => $product_price,
                            );
                        }
                        wp_reset_postdata();
                    }

                    $category_data['products_in_category'] = $products_in_category;
                }

                $added_items[] = $category_data;
            }
        }

        if (empty($added_items) && !empty($duplicate_items)) {
            return Zippy_Response_Handler::error('All provided categories already exist in the database.', $duplicate_items);
        }

        if (empty($added_items)) {
            return Zippy_Response_Handler::error('No valid categories were added to the database.');
        }

        return Zippy_Response_Handler::success(
            array(
                'added_items' => $added_items,
                'duplicate_items' => $duplicate_items,
            ),
            'Category booking mappings processed successfully.'
        );
    }

    public static function get_all_support_booking_categories(WP_REST_Request $request)
    {
        global $wpdb;

        $table_name = $wpdb->prefix . 'product_booking_mapping';

        $items = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT items_id, mapping_type FROM {$table_name} WHERE mapping_type = %s",
                'category'
            ),
            ARRAY_A
        );

        if (empty($items)) {
            return Zippy_Response_Handler::error('No category items found in the database.');
        }

        $categories_data = [];

        foreach ($items as $item) {
            $items_id = $item['items_id'];

            $term = get_term($items_id, 'product_cat');
            $category_name = $term ? $term->name : 'Unknown Category';

            $subcategories = get_terms(array(
                'taxonomy' => 'product_cat',
                'parent' => $items_id,
                'hide_empty' => false,
            ));

            $subcategories_data = [];
            foreach ($subcategories as $subcategory) {
                $product_query = new WP_Query(array(
                    'post_type' => 'product',
                    'posts_per_page' => -1,
                    'post_status' => 'publish',
                    'tax_query' => array(
                        array(
                            'taxonomy' => 'product_cat',
                            'field' => 'id',
                            'terms' => $subcategory->term_id,
                        ),
                    ),
                ));

                $subcategory_products = [];
                if ($product_query->have_posts()) {
                    while ($product_query->have_posts()) {
                        $product_query->the_post();
                        $product_id = get_the_ID();
                        $product_name = get_the_title();
                        $product_price = get_post_meta($product_id, '_price', true);

                        $subcategory_products[] = array(
                            'product_id' => $product_id,
                            'product_name' => $product_name,
                            'product_price' => $product_price,
                        );
                    }
                    wp_reset_postdata();
                }

                $subcategories_data[] = array(
                    'subcategory_id' => $subcategory->term_id,
                    'subcategory_name' => $subcategory->name,
                    'subcategory_products' => $subcategory_products,
                );
            }

            $category_data = array(
                'items_id' => $items_id,
                'mapping_type' => $item['mapping_type'],
                'category_name' => $category_name,
                'subcategories' => $subcategories_data,
            );

            if (empty($subcategories_data)) {
                $product_query = new WP_Query(array(
                    'post_type' => 'product',
                    'posts_per_page' => -1,
                    'post_status' => 'publish',
                    'tax_query' => array(
                        array(
                            'taxonomy' => 'product_cat',
                            'field' => 'id',
                            'terms' => $items_id,
                        ),
                    ),
                ));

                $products_in_category = [];
                if ($product_query->have_posts()) {
                    while ($product_query->have_posts()) {
                        $product_query->the_post();
                        $product_id = get_the_ID();
                        $product_name = get_the_title();
                        $product_price = get_post_meta($product_id, '_price', true);

                        $products_in_category[] = array(
                            'product_id' => $product_id,
                            'product_name' => $product_name,
                            'product_price' => $product_price,
                        );
                    }
                    wp_reset_postdata();
                }

                $category_data['products_in_category'] = $products_in_category;
            }

            $categories_data[] = $category_data;
        }

        return Zippy_Response_Handler::success(
            array('categories' => $categories_data),
            'Category items retrieved successfully.'
        );
    }
    public static function delete_support_booking(WP_REST_Request $request)
    {
        $required_fields = [
            'items_id' => ['required' => true, 'data_type' => 'number'],
            'type' => ['required' => true, 'data_type' => 'range', 'allowed_values' => ['product', 'category']],
        ];

        // Validate Request Fields
        $request_body = $request["request"];

        if (empty($request_body)) {
            Zippy_Response_Handler::error('Request body is required.');
        }

        foreach ($request["request"] as $req) {
            $validate = Zippy_Request_Validation::validate_request($required_fields, $req);
            if(!empty($validate)){
                return Zippy_Response_Handler::error($validate);
            }        
        }    

        try {
            global $wpdb;

            $table_name = ZIPPY_BOOKING_PRODUCT_MAPPING_TABLE_NAME;

            $deleted_items = [];

            // Search if product/category exists in fcs_data_product_booking_mapping table or not
            foreach ($request_body as $body) {

                $item_id = $body["items_id"];
                $item_type = $body["type"];

                $sql = $wpdb->prepare(
                    "SELECT * FROM {$table_name} WHERE items_id = %d AND mapping_type = %s",
                    $body["items_id"],
                    $body["type"],
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
}

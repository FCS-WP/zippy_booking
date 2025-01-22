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
use Zippy_Booking\Src\Services\Zippy_Booking_Helper;

defined('ABSPATH') or die();

class Zippy_Booking_Support_Category_Controller
{
    public static function get_support_product_by_category($category)
    {
        global $wpdb;
        $helperServices = new Zippy_Booking_Helper();
        $table_name = $wpdb->prefix . 'products_booking';
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
                    $extra_price = get_post_meta($product_id, '_extra_price', true);

                    $subcategory_products[] = array(
                        'product_id' => $product_id,
                        'product_name' => $product_name,
                        'product_price' => $product_price,
                        'extra_price' => $extra_price,
                    );
                }
                wp_reset_postdata();
            }
            $subcategory_products = $helperServices->handle_include_products($subcategory_products, $table_name);
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
                    $extra_price = get_post_meta($product_id, '_extra_price', true);

                    $products_in_category[] = array(

                        'items_id' => $product_id,
                        'mapping_type' => 'product',
                        'item_name' => $product_name,
                        'item_price' => $product_price,
                        'item_extra_price' => $extra_price,
                    );
                }
                wp_reset_postdata();
            }

            $category_data = $helperServices->handle_include_products($products_in_category, $table_name);
        }

        $categories_data = $category_data;

        return $categories_data;
    }
    public static function handle_support_booking_category(WP_REST_Request $request)
    {
        global $wpdb;

        $items_id = $request->get_param('items_id');
        $mapping_type = $request["request"]['mapping_type'];

        if (empty($items_id) || $mapping_type !== 'category') {
            return Zippy_Response_Handler::error('Items ID is required and mapping type must be "category".');
        }

        $table_name = $wpdb->prefix . 'products_booking';
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$table_name} WHERE items_id = %d AND mapping_type = %s AND mapping_status = %s",
            $items_id,
            $mapping_type,
            'include'
        ));

        if ($exists > 0) {
            return Zippy_Response_Handler::error('Items ID with this mapping type already exists.');
        }

        $result = $wpdb->insert(
            $table_name,
            array(
                'items_id' => $items_id,
                'mapping_type' => $mapping_type,
                'mapping_status' => 'include'
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
                $extra_price = get_post_meta($product_id, '_extra_price', true);

                $products[] = array(
                    'product_id' => $product_id,
                    'product_name' => $product_name,
                    'product_price' => $product_price,
                    'extra_price' => $extra_price
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
                        $extra_price = get_post_meta($product_id, '_extra_price', true);

                        $subcategory_products[] = array(
                            'product_id' => $product_id,
                            'product_name' => $product_name,
                            'product_price' => $product_price,
                            'extra_price' => $extra_price,
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

        $table_name = $wpdb->prefix . 'products_booking';

        $added_items = [];
        $duplicate_items = [];

        foreach ($categories as $category) {
            $items_id = isset($category['items_id']) ? intval($category['items_id']) : null;
            $mapping_type = isset($category['mapping_type']) ? sanitize_text_field($category['mapping_type']) : null;

            if (!$items_id || $mapping_type !== 'category') {
                continue;
            }

            $exists = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM {$table_name} WHERE items_id = %d AND mapping_type = %s AND mapping_status =%s",
                $items_id,
                $mapping_type,
                'include'
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
                    'mapping_status' => 'include'
                ),
                array(
                    '%d',
                    '%s',
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
                            $extra_price = get_post_meta($product_id, '_extra_price', true);

                            $subcategory_products[] = array(
                                'product_id' => $product_id,
                                'product_name' => $product_name,
                                'product_price' => $product_price,
                                'extra_price' => $extra_price,
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
                            $extra_price = get_post_meta($product_id, '_extra_price', true);

                            $products_in_category[] = array(
                                'product_id' => $product_id,
                                'product_name' => $product_name,
                                'product_price' => $product_price,
                                'extra_price' => $extra_price,
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
        $helperServices = new Zippy_Booking_Helper();

        $table_name = $wpdb->prefix . 'products_booking';
        $requested_id = $request->get_param('category_id');

        if ($requested_id) {
            $items = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT items_id, mapping_type FROM {$table_name} WHERE mapping_type = %s AND items_id = %d AND mapping_status = %s",
                    'category',
                    $requested_id,
                    'include'
                ),
                ARRAY_A
            );
        } else {
            $items = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT items_id, mapping_type FROM {$table_name} WHERE mapping_type = %s AND mapping_status = %s",
                    'category',
                    'include'
                ),
                ARRAY_A
            );
        }

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
                $subcategory_products = [];

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

                if ($product_query->have_posts()) {
                    while ($product_query->have_posts()) {
                        $product_query->the_post();
                        $product_id = get_the_ID();
                        $product_name = get_the_title();
                        $product_price = get_post_meta($product_id, '_price', true);
                        $extra_price = get_post_meta($product_id, '_extra_price', true);

                        $subcategory_products[] = array(
                            'product_id' => $product_id,
                            'product_name' => $product_name,
                            'product_price' => $product_price,
                            'extra_price' => $extra_price,
                        );
                    }
                    wp_reset_postdata();
                }

                $subcategory_products = $helperServices->handle_include_products($subcategory_products, $table_name);
                $subcategories_data[] = array(
                    'subcategory_id' => $subcategory->term_id,
                    'subcategory_name' => $subcategory->name,
                    'products' => $subcategory_products,
                );
            }

            $products_in_category = [];

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

                if ($product_query->have_posts()) {
                    while ($product_query->have_posts()) {
                        $product_query->the_post();
                        $product_id = get_the_ID();
                        $product_name = get_the_title();
                        $product_price = get_post_meta($product_id, '_price', true);
                        $extra_price = get_post_meta($product_id, '_extra_price', true);
                        $products_in_category[] = array(
                            'product_id' => $product_id,
                            'product_name' => $product_name,
                            'product_price' => $product_price,
                            'extra_price' => $extra_price,
                        );
                    }
                    wp_reset_postdata();
                }
            }

            $category_data = array(
                'items_id' => $items_id,
                'mapping_type' => $item['mapping_type'],
                'category_name' => $category_name,
                'subcategories' => $subcategories_data,
                'products_in_category' => $products_in_category,
            );

            $categories_data[] = $category_data;
        }

        $categories_data[0]['products_in_category'] = $helperServices->handle_include_products(
            $categories_data[0]['products_in_category'],
            $table_name
        );

        return Zippy_Response_Handler::success(
            array('categories' => $categories_data),
            $requested_id ? 'Category retrieved successfully.' : 'Categories retrieved successfully.'
        );
    }
}

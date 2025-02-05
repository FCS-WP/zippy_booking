<?php

/**
 * Handle data for controllers
 *
 *
 */

namespace Zippy_Booking\Src\Services;

class Zippy_Booking_Helper
{
    public function handle_include_products ($data_products, $table_name)
    {
        global $wpdb;
        foreach ($data_products as $product) {
            $ids[] = $product['product_id'] ?? $product['items_id'];
        }

        if (is_array($ids) && !empty($ids)) {
            $placeholders = implode(',', array_fill(0, count($ids), '%d'));

            $query = $wpdb->prepare(
                "SELECT items_id
                FROM {$table_name}
                WHERE mapping_type = %s
                AND items_id IN ($placeholders)
                AND mapping_status = %s",
                array_merge(['product'], $ids, ['exclude'])
            );
            // Execute the query
            $product_exclude =  json_decode(json_encode($wpdb->get_results($query)));
        } else {
            $product_exclude = [];
        }
        $exclude_ids = array_column($product_exclude, 'items_id');

        if (isset($data_products)) {
            $includeProducts = array_filter(
                $data_products,
                function ($product) use ($exclude_ids) {
                    $currentId = $product['product_id'] ?? $product['items_id'];
                 
                    return !in_array($currentId, $exclude_ids);
                }
            );
            $data_products = array(...$includeProducts);
        }
        
        return $data_products;
    }

    public function filter_mapping_product ($products) {
        global $wpdb;
        $results = [];
        $mapping_data = $wpdb->get_results("SELECT * FROM fcs_data_products_booking WHERE mapping_status != 'exclude'", ARRAY_A);
        $mapping_ids = wp_list_pluck($mapping_data, 'items_id');
        
        foreach ($products as $product) {
            $is_mapped = false;
            $product_id = $product->get_id();
            // Check if product is in the mapping table
            if (in_array($product_id, $mapping_ids)) {
                $is_mapped = true;
            }

            if (!$is_mapped) {
                $check_exclude = $wpdb->get_results($wpdb->prepare(
                    "SELECT * FROM fcs_data_products_booking WHERE items_id = %d AND mapping_status = 'exclude'", 
                    $product_id
                ));

                if (!$check_exclude) {
                    $category_ids = wp_get_post_terms($product_id, 'product_cat', ['fields' => 'ids']);
                    foreach ($category_ids as $key => $cat_id) {
                        if (in_array($cat_id, $mapping_ids)) {
                            $is_mapped = true;
                        }
                    }
                }
            }
            
            if ($is_mapped) {
                $results[] = [
                    'item_id'    => $product->get_id(),
                    'item_name'  => $product->get_name(),
                    'item_price' => $product->get_price(),
                    'item_extra_price' => get_post_meta($product->get_id(), '_extra_price', true),
                ];
            }
           
        }

        return $results;
    }
}
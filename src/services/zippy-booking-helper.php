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
}
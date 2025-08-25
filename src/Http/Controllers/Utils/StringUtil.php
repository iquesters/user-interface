<?php

namespace Iquesters\UserInterface\Http\Controllers\Utils;

use Illuminate\Support\Str;

class StringUtil extends Str
{
    public static function generateSlug($inputString, $timestamp = false)
    {
        // Convert to lowercase and replace spaces with hyphens
        $slug = strtolower(preg_replace('/[^a-z0-9]+/', '-', $inputString));
        // Remove hyphens from the beginning and end of the string
        $slug = trim($slug, '-');
        // Remove consecutive hyphens
        $slug = preg_replace('/-+/', '-', $slug);

        if ($timestamp === true) {
            // Get current timestamp
            $timestamp = time();

            // Combine slug and timestamp
            $slug .= '_' . $timestamp;
        }

        return $slug;
    }

    public static function sanitizeToCamelCase($string)
    {
        // Remove non-alphanumeric characters and spaces
        $string = preg_replace('/[^a-zA-Z0-9 ]/', '', trim($string, " "));

        // Convert to lowercase
        $string = strtolower($string);

        // Replace spaces with underscores
        $string = str_replace(' ', '_', $string);

        // Convert underscores to camel case
        $string = preg_replace_callback('/_+/', function ($match) {
            return ucfirst($match[0]);
        }, $string);

        // Ensure the first character is lowercase
        $string = lcfirst($string);

        return $string;
    }

    /**
     * This function will convert any string to a valid pascal case
     * @param $str
     * @return string
     */
    public static function convert_pascal_case($str)
    {
        return ucwords(str_replace('_', ' ', trim($str, " ")));
    }

    /**
     * This function will convert any string to a valid hashtag
     * @param $str
     * @return string
     */
    public static function convert_hashtag($str)
    {
        // converting any string remove space and special characters and lowercase
        return preg_replace('/[^a-zA-Z0-9]/', '', strtolower($str));
    }

    /**
     * This function will convert any string to a valid camel case
     * @param $str
     * @return string
     */
    public static function convert_camel_case($str)
    {
        return lcfirst(str_replace(' ', '', ucwords(str_replace('_', ' ', trim($str, " ")))));
    }

    /**
     * This function will convert any string to a valid snake case
     * @param $str
     * @return string
     */
    public static function convert_snake_case($str)
    {
        return strtolower(preg_replace('/[^a-zA-Z0-9]/', '_', trim($str, " ")));
    }

    /**
     * This function will convert any string to a valid kebab case
     * @param $str
     * @return string
     */
    public static function convert_kebab_case($str)
    {
        return strtolower(preg_replace('/[^a-zA-Z0-9]/', '-', trim($str, " ")));
    }

    /**
     * This function will extract distinct values from multiple arrays of string
     * @param ...$arrays
     * @return array
     */
    public static function get_ditinct_values(...$arrays)
    {
        return array_unique(array_merge(...$arrays));
    }

    /**
     * This function will extract hashtags from a string
     * @param $str
     * @return array
     */
    public static function get_hashtags($string)
    {
        $hashtags = [];

        // Match hashtags that can contain Unicode characters, numbers, and underscores
        preg_match_all('/#[\p{L}0-9_]+/u', $string, $matches);

        if (!empty($matches[0])) {
            // Remove the # symbol from each hashtag
            $hashtags = array_map(function ($tag) {
                return substr($tag, 1);
            }, $matches[0]);
        }

        return $hashtags;
    }
}

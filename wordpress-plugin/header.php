<?php
/**
 * Header
 *
 * Setup the header for our theme
 *
 * @package WordPress
 * @subpackage Foundation, for WordPress
 * @since Foundation, for WordPress 1.0
 */

$sign_logo = get_theme_mod('sign_logo');
$sign_orientation = get_theme_mod('sign_orientation', 'landscape');
$sign_headings_background_color = get_theme_mod('sign_headings_background_color', '#000000');
$sign_headings_text_color = get_theme_mod('sign_headings_text_color', '#FFFFFF');
$sign_content_background_color = get_theme_mod('sign_content_background_color', '#FFFFFF');
$sign_content_text_color = get_theme_mod('sign_content_text_color', '#000000');

?>
<!DOCTYPE html>
<!--[if IE 8]> 				 <html class="no-js lt-ie9" lang="en" > <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="<?php language_attributes(); ?>" > <!--<![endif]-->

<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>" />
	<meta name="viewport" content="width=device-width" />
	<title><?php bloginfo('name'); ?></title>
	<link href='http://fonts.googleapis.com/css?family=Roboto:400,100,900' rel='stylesheet' type='text/css'>
	<link rel="stylesheet" href="<?php bloginfo('template_url'); ?>/stylesheets/normalize.css">
	<link rel="stylesheet" href="<?php bloginfo('template_url'); ?>/stylesheets/app.css">
	<link rel="stylesheet" href="<?= get_stylesheet_directory_uri() ?>/overrides.css">

	<style>
		.heading-style {
			background-color: <?= $sign_headings_background_color ?>;
			color: <?= $sign_headings_text_color ?>;
		}
		.body-style {
			background-color: <?= $sign_content_background_color ?>;
			color: <?= $sign_content_text_color ?>;
		}
	</style>
	<script src="<?php bloginfo('template_url'); ?>/javascripts/vendor/custom.modernizr.js"></script>

<title><?php wp_title(); ?></title>

        <?php wp_head(); ?>

</head>

<body <?php body_class(); ?>>
	<div class="content <?= $sign_orientation ?>">

	<header class="heading-block heading-style">
		<div class="logo heading-logo-block">
		<?php if ($sign_logo) { ?>
			<img src="<?= $sign_logo ?>" />
		<?php } ?>
		</div>
		<div class="clock heading-clock-block">
		    <ul>
		        <li id="hours"> </li>
		        <li id="point">:</li>
		        <li id="min"> </li>
		    </ul>
		    <div id="Date"></div>
		</div>
	</header>

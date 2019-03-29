<?php
/**
 * Index
 *
 * Standard loop for the front-page
 *
 * @package WordPress
 * @subpackage Foundation, for WordPress
 * @since Foundation, for WordPress 1.0
 */

get_header(); ?>

<?php

	$args=array(
      'post_type' => 'post',
      'post_status' => 'publish',
      'orderby' => 'rand'
  );
  $the_query = new WP_Query($args);

	// Available widget areas are signage_events_feed_1, signage_events_feed_2, and signage_ticker

	$sign_has_feeds = is_active_sidebar('signage_events_feed_1') || is_active_sidebar('signage_events_feed_2');
	$sign_has_ticker = is_active_sidebar('signage_ticker');
	$sign_hide_feeds = get_theme_mod('sign_hide_feeds') || !($sign_has_ticker || $sign_has_feeds);
	$sign_rotation_speed = get_theme_mod( "sign_rotation_speed_seconds", 15 ) * 1000; //default rotation speed 15s
  $sign_refresh_period = get_theme_mod('sign_refresh_after_cycle', 3) * $sign_rotation_speed * $the_query->post_count;

  $slide_layout_classes = $sign_has_feeds ? " with-feeds" : " no-feeds";
  $slide_layout_classes .= $sign_has_ticker ? " with-ticker" : " no-ticker";
?>

<div class="row slide-block body-style <?= $slide_layout_classes ?>">
    <!-- Main Content -->
    <div class="large-12 columns slide-container" role="content">
			<ul id="post-area" data-orbit data-options="timer_speed:<?= $sign_rotation_speed ?>;" data-refresh-after="<?= $sign_refresh_period ?>">
	            <?php
	            if($the_query->have_posts()) : while ( $the_query->have_posts() ) : $the_query->the_post();
				$large_image_url = wp_get_attachment_image_src( get_post_thumbnail_id($post->ID), 'large');

					echo '<li class="post-box large-12 columns ' . get_post_format() . '" style="background:#' . get_post_meta($post->ID, '_digitalsign_bgcolor', true) . ';">',
						'<h1 style="color:#' . get_post_meta($post->ID, '_digitalsign_h1color', true) . ';">' . get_the_title() . '</h1>',
						'<h2 style="color:#' . get_post_meta($post->ID, '_digitalsign_h2color', true) . ';">' . get_post_meta($post->ID, '_digitalsign_subtitle', true) . '</h2>',
						'<div class="row">',
						'<a href="http://' . get_post_meta($post->ID, '_digitalsign_link', true) . '">',
						get_the_post_thumbnail($post_id, 'large', array('class' => 'large-3 columns feature')),
						'</a>',
						'<p class="large-7 columns copy end" style="color:#' . get_post_meta($post->ID, '_digitalsign_pcolor', true) . ';">' . do_shortcode( get_the_content() ) . '</p>',
						'<p class="link"><a  style="color:#' . get_post_meta($post->ID, '_digitalsign_pcolor', true) . ';" href="http://' . get_post_meta($post->ID, '_digitalsign_link', true) . '">' . get_post_meta($post->ID, '_digitalsign_link', true) . '</a>',
						'</div>',
						'</li>';
	            endwhile;
	            endif;
				wp_reset_query();
	            ?>
			</ul>
	</div>
</div>

<?php if (!$sign_hide_feeds) { ?>
	<div class="feeds feeds-block">
		<div class="row feeds-main-block">
			<div class="feeds-feed-block">
				<?php dynamic_sidebar("signage_events_feed_1"); ?>
			</div>
			<div class="feeds-feed-block">
				<?php dynamic_sidebar("signage_events_feed_2"); ?>
			</div>
		</div>
	</div>
	<div class="row ticker feeds-ticker-block">
		<?php dynamic_sidebar("signage_ticker"); ?>
	</div>
<?php } ?>


    <!-- End Main Content -->

<?php get_footer(); ?>

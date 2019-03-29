<?php
add_action( 'wp_enqueue_scripts', 'theme_enqueue_styles' );
function theme_enqueue_styles() {
    wp_enqueue_style( 'parent-style', get_template_directory_uri() . '/style.css' );

}

/**
 * Register our post formats.
 *
 */

function add_format_support() {
	add_theme_support( 'post-formats', array( 'image', 'gallery') );
}
add_action( 'after_setup_theme', 'add_format_support', 20 );

function set_default_post_format( $format )
{
    return 'image';
}
add_filter( 'option_default_post_format', 'set_default_post_format', 10, 1 );

// Add format box back
// ZB: it did not work to use add_meta_box had to modify original

/**
 * Register our sidebars and widgetized areas.
 *
 */
function signage_widgets_init() {
	// Not using the doc in this theme:
	unregister_sidebar('dock');
	register_sidebar( array(
		'name'          => 'Events Box',
		'id'            => 'signage_events_feed_1',
		'before_widget' => '<div class="signage-events body-style">',
		'after_widget'  => '</div>',
		'before_title'  => '<h2 class="signage-events-title heading-style">',
		'after_title'   => '</h2>',
	) );
	register_sidebar( array(
		'name'          => 'Second Events Box',
		'id'            => 'signage_events_feed_2',
		'before_widget' => '<div class="signage-events body-style">',
		'after_widget'  => '</div>',
		'before_title'  => '<h2 class="signage-events-title heading-style">',
		'after_title'   => '</h2>',
	) );
	register_sidebar( array(
		'name'          => 'News Ticker Area',
		'id'            => 'signage_ticker',
		'before_widget' => '<div class="signage-ticker body-style">',
		'after_widget'  => '</div>',
		'before_title'  => '<h2 class="signage-ticker-title heading-style">',
		'after_title'   => '</h2>',
	) );
}
add_action( 'widgets_init', 'signage_widgets_init' );


/**
*	Theme options
*
*/
function register_theme_custimization_options( $wp_customize ) {
   $wp_customize->add_setting( 'sign_logo' 						, array() );
   $wp_customize->add_setting( 'sign_orientation' 				, array('default'=>'portrait') );
   $wp_customize->add_setting( 'sign_headings_background_color'	, array('default'=>'#000000') );
   $wp_customize->add_setting( 'sign_headings_text_color' 		, array('default'=>'#FFFFFF') );
   $wp_customize->add_setting( 'sign_content_background_color' 	, array('default'=>'#FFFFFF') );
   $wp_customize->add_setting( 'sign_content_text_color' 		, array('default'=>'#000000') );
   $wp_customize->add_setting( 'sign_hide_feeds'		 		, array('default'=>'false') );
   $wp_customize->add_setting( 'sign_rotation_speed_seconds'	, array('default'=>20) );
   $wp_customize->add_setting( 'sign_refresh_after_cycle'  , array('default'=>3) );

   $wp_customize->add_section( 'sign_options_section' , array(
    'title'      => 'Digital Sign Options',
    'priority'   => 30,
	) );
   $wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sign_orientation_conroller', array(
		'label'      => 'Screen Orientation',
		'section'    => 'sign_options_section',
		'settings'   => 'sign_orientation',
		'type'       => 'radio',
        'choices'    => array(
			            'portrait' 	=> 'portrait',
			            'landscape' => 'landscape'
        			)
	) ) );
   $wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, 'sign_logo_controller', array(
		'label'      => 'Logo Image',
		'section'    => 'sign_options_section',
		'settings'   => 'sign_logo',
	) ) );
   $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'sign_headings_background_color_controller', array(
		'label'      => 'Headings Background',
		'section'    => 'sign_options_section',
		'settings'   => 'sign_headings_background_color',
	) ) );
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'sign_headings_text_color_controller', array(
		'label'      => 'Headings Text',
		'section'    => 'sign_options_section',
		'settings'   => 'sign_headings_text_color',
	) ) );
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'sign_content_background_color_controller', array(
		'label'      => 'Content Background',
		'section'    => 'sign_options_section',
		'settings'   => 'sign_content_background_color',
	) ) );
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'sign_content_text_color_controller', array(
		'label'      => 'Content Text',
		'section'    => 'sign_options_section',
		'settings'   => 'sign_content_text_color',
	) ) );
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sign_hide_feeds_conroller', array(
		'label'      => 'Hide Feeds Section',
		'section'    => 'sign_options_section',
		'settings'   => 'sign_hide_feeds',
		'type'       => 'radio',
        'choices'    => array(
			            'true' 	=> 'True',
			            'false' => 'False'
        			)
	) ) );
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sign_rotation_speed_seconds_controller', array(
		'label'      => 'Rotation Speed (seconds)',
		'section'    => 'sign_options_section',
		'settings'   => 'sign_rotation_speed_seconds',
		'type'       => 'text'
	) ) );
  $wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sign_refresh_after_cycles_controller', array(
    'label'      => 'Refresh after slides have cycled (n times)',
    'section'    => 'sign_options_section',
    'settings'   => 'sign_refresh_after_cycle',
    'type'       => 'text'
  ) ) );
}
add_action( 'customize_register', 'register_theme_custimization_options' );


?>

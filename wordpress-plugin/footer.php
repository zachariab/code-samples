<?php
/**
 * Footer
 *
 * Displays content shown in the footer section
 *
 * @package WordPress
 * @subpackage Foundation, for WordPress
 * @since Foundation, for WordPress 1.0
 */

?>

</div> <!-- /.content -->

	<?php wp_footer(); ?>
	<script src='//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js' type='text/javascript' charset='utf-8'></script>

	<!-- CDN Fallback -->
	<script type="text/javascript">
	if (typeof jQuery == 'undefined') {
	    document.write(unescape("%3Cscript src='<?php bloginfo('template_url'); ?>/javascripts/vendor/jquery.js' type='text/javascript'%3E%3C/script%3E"));
	}
	</script>


    <script src="<?php bloginfo('template_url'); ?>/javascripts/foundation/foundation.js"></script>
    <script>
       var mq = window.matchMedia( "(min-width: 960px)" );
	   if (mq.matches) {
		  document.write(unescape("%3Cscript src='<?php bloginfo('template_url'); ?>/javascripts/foundation/foundation.orbit.js' type='text/javascript'%3E%3C/script%3E"));
		}
	</script>
    <script src="<?= get_stylesheet_directory_uri() ?>/app.js"></script>
    <!--<script src="<?php bloginfo('template_url'); ?>/javascripts/vendor/twitterFetcher_v10_min.js"></script>-->

  <script>
$(function() {
    $(document).foundation();
});

    //twitterFetcher.fetch('393025966789754880', 'tweets', 1, true, true, false);
  </script>

 </body>
</html>

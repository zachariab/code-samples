module.exports = function(grunt) {

  grunt.initConfig({

    clean: ["dist"],
    uglify: {
      options: {
        banner: '/*! Mac-Social built <%= grunt.template.today("dd-mm-yyyy") %> */\n'/*,
        beautify: true,
        compress: false,
        mangle: false*/
      },
      dist: {
        'files': {
          'dist/public/javascript/require.js'   : ["frontends/bower_components/requirejs/require.js"]
        }
      }
    },
    sass: {
    	options: {
        	banner: '/*! Mac-Social Grunt Build <%= grunt.template.today("dd-mm-yyyy") %> */\n',
          style: 'compressed'
      	},
    	'public': {
	    	files: {
	          'dist/public/css/macsocial.css': ['frontends/public/scss/index.scss']
	        }
    	}
    },
    rsync: {
    	'public-images': {
    		options: {
    			src: 'frontends/public/images/*',
    			dest: 'dist/public/images/',
          exclude: ["*.svg"]
    			}
    		},
    	'public-html': {
    		options: {
    			src: 'frontends/public/*.html',
    			dest: 'dist/public/'
    		}
    	},
    	deploy: {
	      options: {
	            src: 'dist/*',
	            dest: '<%= deployPath %>',
	            exclude: [".*"],
	            delete: true,
	            args: ["--verbose", "--size-only", "-r"]
	        }  
	    }
    },
    requirejs: {
      compile: {
        options: {
          name: "macsocial",
          baseUrl: "frontends/public/javascript/",
          mainConfigFile: "frontends/public/javascript/macsocial.js",
          out: "dist/public/javascript/macsocial.js"
          /* , uglify: {
            beautify: true,
            compress: false,
            mangle: false
          }*/
        }
      }
    },
    svgmin: {
      dist: {
          files: [{
            expand: true,
            src: "*.svg",
            dest: "dist/public/images/",
            cwd: "frontends/public/images"
          }]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-rsync');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-svgmin');
  
  grunt.registerTask('build', ['clean', 'uglify', 'requirejs', 'sass', 'rsync:public-images', 'svgmin', 'rsync:public-html']);
  grunt.registerTask('deploy', ['build', 'rsync:deploy']);
  grunt.registerTask('default', ['build']);

};
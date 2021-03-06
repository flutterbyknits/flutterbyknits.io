var port = 4000; // Port to run local server on
var protocol = 'http'; // Protocol to run local server on
var audioAlert = 'wav'; // Options - beep, wav, silent

module.exports = function(grunt) {
	require('load-grunt-config')(grunt); // Save us having to do grunt.loadNpmTasks() for every plugin we use
	require('time-grunt')(grunt); // Get timings of how long each task took (more useful for 'build' than 'develop')
	require('./grunt_stuff/custom-tasks.js')(grunt, port, audioAlert); // Import our custom Grunt tasks

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		// Empty out the contents of dist for a fresh build
		clean: {
			all: ['dist/'],
			styles: { // Don't think this actually needed here?
				src: [ 'dist/styles/**/*.css', '!dist/styles/main.min.css' ]
			}
		},

		// Copy over files from src to dist
		copy: {
			options: {},
			scripts: {
				expand: true,
				cwd: 'src/',
				// Copy all JS
				src: ['scripts/**/*.js'],
				dest: 'dist/',
				filter: 'isFile'
			},
			html: {
				expand: true,
				cwd: 'src/',
				// Copy all HTML except the /includes folder
				src: ['**/*.html', '!includes/**/*.html'],
				dest: 'dist/',
				filter: 'isFile'
			},
			images: {
				expand: true,
				cwd: 'src/',
				// Copy all images
				src: ['images/**/*.{png,jpg,gif,svg}'],
				dest: 'dist/',
				filter: 'isFile'
			},
			develop: {
				expand: true,
				cwd: 'src/',
				// Copy everything except LESS and SASS files
				src: ['**', '!styles/**/*.{less,scss,sass}'],
				dest: 'dist/',
				filter: 'isFile'
			},
			build: {
				expand: true,
				cwd: 'src/',
				// Copy anything which isn't LESS, SASS, JS, images and HTML (as they will be handled by other tasks)
				src: ['**', '!styles/**/*.{less,scss,sass}', '!styles/**/*.css.map', '!scripts/**/*', '!images/*', '!includes/**/*.html'],
				dest: 'dist/',
				filter: 'isFile'
			}
		},

		// Run JShint on all of JS files (but not on vendor files)
		jshint: {
			options: {
				reporter: require('jshint-stylish')
			},
			all: ['src/scripts/**/*.js', '!src/scripts/vendor/**/*.js']
		},

		// Uglify all of our JavaScript into one file (but not on vendor files)
		uglify: {
			options: {},
			build: {
				files: {
				  'dist/scripts/main.min.js': ['dist/scripts/main.js']
				}
			}
		},

		// Compile JS modules into a single file (but not on vendor files)
		browserify: {
			options: {
				browserifyOptions: {
					debug: true
				}
			},
			all: {
				files: {
					'dist/scripts/main.js': ['src/scripts/**/*.js', '!src/scripts/vendor/**/*.js']
				}
			}
		},

		// Combine all of the vendor JS files into a single file
		concat: {
			options: {},
			build: {
				src: ['src/scripts/vendor/jquery-1.12.4.min.js', 'src/scripts/vendor/**/*.js'],
				dest: 'dist/scripts/vendor.min.js'
			}
		},

		// Automatically compile LESS into CSS
		less: {
			options: {},
			develop: {
				options: {
					sourceMap: true
				},
				files: [{
					expand: true,
					cwd: 'src/styles',
					src: ['**/*.less'],
					dest: 'dist/styles',
					ext: '.css'
				}]
			},
			build: {
				files: [{
					expand: true,
					cwd: 'src/styles',
					src: ['**/*.less'],
					dest: 'dist/styles',
					ext: '.css'
				}]
			}
		},

		// Automatically compile SASS into CSS
		sass: {
			options: {},
			develop: {
				options: {
					sourceMap: true
				},
				files: [{
					expand: true,
					cwd: 'src/styles',
					src: ['**/*.{scss,sass}'],
					dest: 'dist/styles',
					ext: '.css'
				}]
			},
			build: {
				files: [{
					expand: true,
					cwd: 'src/styles',
					src: ['**/*.{scss,sass}'],
					dest: 'dist/styles',
					ext: '.css'
				}]
			}
		},
		//create spritesheet
		"svg-sprites": {
			"sprites": {
				options: {
					spriteElementPath: "src/images/sprites/separate",
					spritePath: "src/images/sprites/sprite.svg",
					cssPath: "src/styles/common/_spritesheet.scss",
					prefix: "icn",
			}
			}
		},
		// Minify all CSS files into a single file
		cssmin: {
			options: {},
			build: {
				files: {
					'dist/styles/main.min.css': 'dist/styles/**/*.css'
				}
			}
		},

		// Optimise all image files
		imagemin: {
			options: {},
			build: {
				files: [{
					expand: true,
					cwd: 'src/',
					src: ['**/*.{png,jpg,gif,svg}'],
					dest: 'dist/'
				}]
			}
		},

		// Process our HTML includes
		// Replace JS and CSS imports for minified build versions
		processhtml: {
			options: {
        		recursive: true,
        		customBlockTypes: ['./grunt_stuff/handlebars-blocktype.js', './grunt_stuff/css-js-blocktypes.js']
			},
			develop: {
				files: [{
					expand: true,
					cwd: 'src/',
					src: ['**/*.html', '!includes/**/*.html'],
					dest: 'dist/'
				}]
			},
			build: {
				files: [{
					expand: true,
					cwd: 'dist/',
					src: ['**/*.html', '!includes/**/*.html'],
					dest: 'dist/'
				}]
			}
		},

		// Launch a local development server with LiveReloading
		connect: {
			options: {
				port: port,
				base: 'dist/',
				hostname: '*',
				livereload: true,
				protocol: protocol
			},
			livereload: {
				options: {
					open: {
						target: protocol + '://localhost:' + port
					},
					base: [
						'dist/'
					]
				}
			}
		},

		// Watch for file changes
		watch: {
			less: {
				files: ['src/styles/**/*.less'],
				tasks: ['less:develop', 'beepOnError'],
				options: {
					livereload: true,
					nospawn: true
				}
			},

			sass: {
				files: ['src/styles/**/*.{scss,sass}'],
				tasks: ['sass:develop', 'beepOnError'],
				options: {
					livereload: true,
					nospawn: true
				}
			},

			scripts: {
				files: 'src/scripts/**/*.js',
				tasks: ['newer:jshint', 'beepOnError', 'browserify'],
				options: {
					livereload: true,
					nospawn: true
				}
			},

			html: {
				files: ['src/**/*.html', '!src/includes/**/*.html'],
				tasks: ['newer:processhtml:develop', 'beepOnError'],
				options: {
					livereload: true,
					nospawn: true
				}
			},

			includes: {
				files: 'src/includes/**/*.html',
				tasks: ['processhtml:develop', 'beepOnError'],
				options: {
					livereload: true,
					nospawn: true
				}
			},

			images: {
				files: 'src/images/**/*',
				tasks: ['newer:copy:images', 'beepOnError'],
				options: {
					livereload: true,
					nospawn: true
				}
			}
		}
	});

	// 'develop' task for active site development
	grunt.registerTask('develop', ['jshint', 'clean:all', 'svg-sprites', 'copy:develop', 'browserify', 'less:develop', 'sass:develop', 'processhtml:develop', 'connect', 'getip', 'beepOnError', 'beepOnSuccess', 'turnForceOn', 'watch']);

	// 'build' task for creating a clean, optimised set of files for distribution
	grunt.registerTask('build',   ['jshint', 'clean:all', 'svg-sprites', 'copy:build', 'browserify', 'uglify', 'concat', 'less:build', 'sass:build', 'cssmin', 'clean:styles', 'imagemin', 'processhtml:develop', 'processhtml:build', 'beepOnError', 'beepOnSuccess']);
};

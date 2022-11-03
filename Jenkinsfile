pipeline {
	agent none 
	environment {
    		NPM_CONFIG_CACHE = "${WORKSPACE}/.npm"
	}
	stages {
		stage('Build') {
			agent { docker { image 'nestjs/cli' } }
            		steps {
                		sh 'npm --version'
				sh 'nest info'
		    		sh 'npm install'
				sh 'nest start'
            		}
		}
	}
}

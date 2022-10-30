pipeline {
	agent none 
	stages {
		stage('Build') {
			agent {
                docker { image 'nestjs/cli' }
            }
            steps {
                sh 'npm --version'
				sh 'nest info'
		    		sh 'sudo npm install'
				sh 'nest start'
            }
		}
	}
}

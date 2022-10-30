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
				sh 'nest start'
            }
		}
	}
}

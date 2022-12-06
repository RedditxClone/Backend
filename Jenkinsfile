pipeline {
	agent any
	stages {
		stage('Docker') {
			environment {
				MONGO_INITDB_ROOT_USERNAME = credentials('MONGO_INITDB_ROOT_USERNAME')
        		MONGO_INITDB_ROOT_PASSWORD = credentials('MONGO_INITDB_ROOT_PASSWORD')
				JWT_SECRET = credentials('JWT_SECRET')
				FORGET_PASSWORD_SECRET = credentials('FORGET_PASSWORD_SECRET')
				SU_USERNAME = credentials('SU_USERNAME')
				SU_EMAIL = credentials('SU_EMAIL')
				SU_PASS = credentials('SU_PASS')
        EMAIL_USER = credentials('EMAIL_USER')
				EMAIL_PASS = credentials('EMAIL_PASS')
    		}
            steps {
				sh  '''
					export DB_CONNECTION_STRING=mongodb://$MONGO_INITDB_ROOT_USERNAME:$MONGO_INITDB_ROOT_PASSWORD@mongo-db:27017
					docker-compose up --build -d
					'''
            }
		}
	}
}

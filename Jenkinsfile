
pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'project-2-cicd:1.0.0'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Source code checked out by Jenkins SCM'
            }
        }

        stage('Verify Environment') {
            steps {
                sh '''
                    node --version
                    npm --version
                    docker --version
                '''
            }
        }

        stage('Install and Test') {
            steps {
                sh '''
                    npm install
                    npm test
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    script {
                        def scannerHome = tool 'SonarScanner'
                        sh """
                            "\${scannerHome}/bin/sonar-scanner"
                        """
                    }                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build -t "$DOCKER_IMAGE" .
                '''
            }
        }
    }

    post {
        success {
            echo 'CI pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check Console Output.'
        }
    }
}


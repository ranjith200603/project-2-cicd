
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
                    echo "Node.js Version:"
                    node --version

                    echo "NPM Version:"
                    npm --version

                    echo "Docker Version:"
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
                    sh '''
                        /var/jenkins_home/tools/hudson.plugins.sonar.SonarRunnerInstallation/SonarScanner/bin/sonar-scanner
                    '''
                }
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

        always {
            echo 'CI pipeline execution completed.'
        }
    }
}


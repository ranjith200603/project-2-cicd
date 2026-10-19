
pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'ranjithkumarrk27/project-2-cicd'
        APP_CONTAINER = 'project-2-app'
        APP_PORT = '3001'
        APP_INTERNAL_PORT = '3000'
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
                    sh '''
                        /var/jenkins_home/tools/hudson.plugins.sonar.SonarRunnerInstallation/SonarScanner/bin/sonar-scanner
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    script {
                        def qualityGate = waitForQualityGate(
                            abortPipeline: true
                        )
                        echo "Quality Gate: ${qualityGate.status}"
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build -t "$DOCKER_IMAGE:$BUILD_NUMBER" .
                    docker tag "$DOCKER_IMAGE:$BUILD_NUMBER" "$DOCKER_IMAGE:latest"
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKERHUB_USER',
                        passwordVariable: 'DOCKERHUB_TOKEN'
                    )
                ]) {
                    sh '''
                        set +x
                        echo "$DOCKERHUB_TOKEN" | docker login \
                            --username "$DOCKERHUB_USER" --password-stdin

                        docker push "$DOCKER_IMAGE:$BUILD_NUMBER"
                        docker push "$DOCKER_IMAGE:latest"

                        docker logout
                    '''
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                sh '''
                    docker pull "$DOCKER_IMAGE:latest"

                    docker rm -f "$APP_CONTAINER" || true

                    docker run -d \
                        --name "$APP_CONTAINER" \
                        --restart unless-stopped \
                        -p "$APP_PORT:$APP_INTERNAL_PORT" \
                        "$DOCKER_IMAGE:latest"
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    ATTEMPTS=12

                    for i in $(seq 1 "$ATTEMPTS"); do
                        if curl -fsS \
                            "http://localhost:$APP_PORT/health"; then
                            echo "Application health check passed."
                            exit 0
                        fi

                        echo "Waiting for application... ($i/$ATTEMPTS)"
                        sleep 5
                    done

                    echo "Health check failed."
                    docker logs "$APP_CONTAINER" || true
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            echo 'CI/CD successful: tests, quality gate, Docker Hub push and deployment completed.'
        }

        failure {
            echo 'Pipeline failed. Check Console Output.'
        }

        always {
            echo 'Pipeline execution completed.'
        }
    }
}

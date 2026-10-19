
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
                    set -e
                    echo "Node.js:"
                    node --version

                    echo "NPM:"
                    npm --version

                    echo "Docker:"
                    docker --version
                '''
            }
        }

        stage('Install and Test') {
            steps {
                sh '''
                    set -e
                    npm install
                    npm test
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        set -e
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
                    set -e

                    docker build \
                        -t "$DOCKER_IMAGE:$BUILD_NUMBER" .

                    docker tag \
                        "$DOCKER_IMAGE:$BUILD_NUMBER" \
                        "$DOCKER_IMAGE:latest"
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
                        set -e
                        set +x

                        echo "$DOCKERHUB_TOKEN" | docker login \
                            --username "$DOCKERHUB_USER" \
                            --password-stdin

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
                    set -e

                    docker pull "$DOCKER_IMAGE:latest"

                    docker rm -f "$APP_CONTAINER" || true

                    docker run -d \
                        --name "$APP_CONTAINER" \
                        --restart unless-stopped \
                        -p "$APP_PORT:$APP_INTERNAL_PORT" \
                        "$DOCKER_IMAGE:latest"

                    echo "Deployment container started."
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    set -e

                    ATTEMPTS=12

                    for i in $(seq 1 "$ATTEMPTS"); do
                        if docker exec "$APP_CONTAINER" node -e "
                            fetch('http://127.0.0.1:3000/health')
                              .then(async r => {
                                console.log(await r.text());
                                process.exit(r.ok ? 0 : 1);
                              })
                              .catch(() => process.exit(1));
                        "; then
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
            echo 'SUCCESS: CI, tests, SonarQube, Docker Hub push and deployment completed!'
        }

        failure {
            echo 'FAILED: Check Console Output for the failing stage.'
        }

        always {
            echo 'CI/CD pipeline execution completed.'
        }
    }
}

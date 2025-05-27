pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "sadullaa/book-frontend:${BUILD_NUMBER}"
        BACKEND_IMAGE  = "sadullaa/book-backend:${BUILD_NUMBER}"
        KUBECONFIG = credentials('k8s-config')  // Stored kubeconfig secret
    }

    stages {
        stage('Clone Repository') {
            steps {
                echo "📦 Cloning repository..."
                git branch: 'master', url: 'https://github.com/Sadulla0123/BookReview.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    try {
                        echo "🐳 Building frontend image..."
                        bat "docker build -t ${FRONTEND_IMAGE} ./frontend"
                        
                        echo "🐳 Building backend image..."
                        bat "docker build -t ${BACKEND_IMAGE} ./backend"
                    } catch (Exception e) {
                        error("Docker build failed: ${e.message}")
                    }
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    script {
                        retry(3) {
                            bat """
                                docker login -u %DOCKER_USER% -p %DOCKER_PASS%
                                docker push ${FRONTEND_IMAGE}
                                docker push ${BACKEND_IMAGE}
                                docker logout
                            """
                        }
                    }
                }
            }
        }

        stage('Update Deployment YAMLs') {
            steps {
                script {
                    // Replace REPLACE_TAG_HERE with the actual BUILD_NUMBER tag
                    bat """
                    powershell -Command "(Get-Content k8s/frontend-deployment.yaml) -replace 'REPLACE_TAG_HERE', '${BUILD_NUMBER}' | Set-Content k8s/frontend-deployment.yaml"
                    powershell -Command "(Get-Content k8s/backend-deployment.yaml) -replace 'REPLACE_TAG_HERE', '${BUILD_NUMBER}' | Set-Content k8s/backend-deployment.yaml"
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    // Apply manifests with validation
                    bat "kubectl apply -f k8s/frontend-deployment.yaml --validate=true"
                    bat "kubectl apply -f k8s/frontend-service.yaml"
                    bat "kubectl apply -f k8s/backend-deployment.yaml"
                    bat "kubectl apply -f k8s/backend-service.yaml"

                    // Rolling update
                    bat "kubectl rollout restart deployment/frontend-deployment"
                    bat "kubectl rollout restart deployment/backend-deployment"
                    
                    // Verify deployment status
                    bat "kubectl rollout status deployment/frontend-deployment --timeout=300s"
                    bat "kubectl rollout status deployment/backend-deployment --timeout=300s"
                }
            }
        }
    }

    post {
        always {
            cleanWs()
            bat "docker rmi ${FRONTEND_IMAGE} || echo 'Frontend image not found'"
            bat "docker rmi ${BACKEND_IMAGE} || echo 'Backend image not found'"
        }
        
        success {
            slackSend(
                channel: '#deployments',
                message: "✅ Successfully deployed build ${BUILD_NUMBER}!\nFrontend: ${FRONTEND_IMAGE}\nBackend: ${BACKEND_IMAGE}"
            )
        }
        
        failure {
            slackSend(
                channel: '#deployments',
                message: "❌ Deployment failed for build ${BUILD_NUMBER}!\nCheck logs: ${BUILD_URL}"
            )
        }
    }
}

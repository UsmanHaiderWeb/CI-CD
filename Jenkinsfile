pipeline {
    agent { label "deployment" }

    stages {
        stage('Code') {
            steps {
                echo "Getting Code from Git"
                git url: "https://github.com/UsmanHaiderWeb/CI-CD.git", branch: "main"
            }
        }

        stage('Build & Push Image') {
            steps {
                sh '''
                    docker build -t usmanhaider12/ci-cd-frontend:latest ./CI-CD-Frontend
                    docker build -t usmanhaider12/ci-cd-backend:latest ./CI-CD-Backend
                    docker image prune -f
                '''
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                echo "Pushing images to docker hub"
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-creds',
                    usernameVariable: 'DOCKER_HUB_USERNAME',
                    passwordVariable: 'DOCKER_HUB_PASSWORD'
                )]) {
                    sh '''
                        echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_HUB_USERNAME" --password-stdin
                        docker push usmanhaider12/ci-cd-frontend:latest
                        docker push usmanhaider12/ci-cd-backend:latest
                    '''
                }
            }
        }

        stage('Deployment') {
            steps {
                echo "lets deploy"
                sh '''
                    cd ~/app/
                    docker-compose up -d --force-recreate
                '''
            }
        }
    }

    post {
        always {
            echo "Here write what run happen in any case"
        }
    }
}

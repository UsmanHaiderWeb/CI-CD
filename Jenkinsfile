pipeline {
    agent { label 'gcp-agent' }

    environment {
        APP_NAME = 'workspace-frontend'
        DEPLOY_LOG_DIR = '/home/imran/deploy_logs'
        GITHUB_PAT = credentials('github-pat')
        GIT_REPO = 'https://github.com/imghani/paklawassist-client-v2.git'
        GCP_REGION = 'us-central1'
        GCP_PROJECT = 'paklawassistapp'
        GCP_ARTIFACT_REPO = 'frontend'
        BUILD_TAG = "${env.BUILD_NUMBER}"
        DOCKER_IMAGE = 'workspace-frontend'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
        skipDefaultCheckout()
    }

    stages {
        stage('Prepare') {
            steps {
                script {
                    sh """
                        rm -rf workspace-frontend
                        mkdir -p ${DEPLOY_LOG_DIR}
                    """
                }
            }
        }

        stage('Clone Repo') {
            steps {
                sh """
                    git clone --depth=1 https://${GITHUB_PAT}@github.com/imghani/paklawassist-client-v2.git workspace-frontend
                """
            }
        }

        stage('Prepare .env') {
            steps {
                withCredentials([file(credentialsId: 'frontend-env', variable: 'ENV_FILE')]) {
                    sh 'cp $ENV_FILE workspace-frontend/.env'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                dir('workspace-frontend') {
                    sh """
                        docker build -t ${DOCKER_IMAGE}:build-${BUILD_TAG} .
                        docker tag ${DOCKER_IMAGE}:build-${BUILD_TAG} ${DOCKER_IMAGE}:latest
                    """
                }
            }
        }

        stage('Authenticate to Google Artifact') {
            steps {
                withCredentials([file(credentialsId: 'gcp-artifact-key', variable: 'GCP_KEY')]) {
                    sh """
                        gcloud auth activate-service-account --key-file=$GCP_KEY
                        gcloud auth configure-docker ${GCP_REGION}-docker.pkg.dev
                    """
                }
            }
        }

        stage('Push Docker Image to Artifact Registry') {
            steps {
                sh """
                    docker tag ${DOCKER_IMAGE}:build-${BUILD_TAG} ${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT}/${GCP_ARTIFACT_REPO}/${DOCKER_IMAGE}:build-${BUILD_TAG}
                    docker tag ${DOCKER_IMAGE}:latest ${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT}/${GCP_ARTIFACT_REPO}/${DOCKER_IMAGE}:latest
                    docker push ${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT}/${GCP_ARTIFACT_REPO}/${DOCKER_IMAGE}:build-${BUILD_TAG}
                    docker push ${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT}/${GCP_ARTIFACT_REPO}/${DOCKER_IMAGE}:latest

                    IMAGES=\$(gcloud artifacts docker images list ${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT}/${GCP_ARTIFACT_REPO}/${DOCKER_IMAGE} --format='get(tags)')
                    TO_DELETE=\$(echo "\$IMAGES" | grep build- | sort -r | tail -n +5)
                    for img in \$TO_DELETE; do
                        gcloud artifacts docker images delete -q ${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT}/${GCP_ARTIFACT_REPO}/${DOCKER_IMAGE}@\${img}
                    done

                    docker image prune -f
                """

            }
        }


        stage('Deploy New Container') {
            steps {
                sh 'docker-compose pull frontend >> ${DEPLOY_LOG_DIR}/deploy_$(date +%F_%T).log 2>&1'
                sh 'docker-compose up -d --no-deps --build frontend'
            }
        }

        stage('Post Deployment Check') {
            steps {
                sh """
                    docker-compose ps | grep ${APP_NAME} || exit 1
                """
            }
        }
    }

    post {
        failure {
            echo "❌ Deployment failed! Attempting rollback..."
            script {
                def lastSuccessful = sh(
                    script: "gcloud artifacts docker images list ${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT}/${GCP_ARTIFACT_REPO}/${DOCKER_IMAGE} --format='get(tags)' | grep build- | sort -r | sed -n '2p'",
                    returnStdout: true
                ).trim()
                
                if (lastSuccessful) {
                    echo "Rolling back to ${lastSuccessful}"
                    sh """
                        docker-compose pull frontend
                        docker-compose up -d --no-deps --build frontend
                    """
                } else {
                    echo "No previous successful image available for rollback!"
                }
            }
        }
    }
}

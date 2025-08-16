pipeline {
  agent any

  options {
    ansiColor('xterm')
    timestamps()
    disableConcurrentBuilds()
  }

  triggers {
    githubPush()
  }

  environment {
    EC2_HOST = '16.171.129.6'
  }

  stages {
    stage('Clean Workspace') {
      steps {
        cleanWs()
      }
    }

    stage('Checkout (SCM)') {
      steps {
        checkout([
          $class: 'GitSCM',
          branches: [[name: '*/main']],
          userRemoteConfigs: [[
            url: 'https://github.com/UsmanHaiderWeb/CI-CD.git',
            credentialsId: 'github-creds'
          ]]
        ])

        script {
          env.GIT_SHA  = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
          env.SHA7     = sh(returnStdout: true, script: 'git rev-parse --short=7 HEAD').trim()
          echo "Checked out commit ${env.GIT_SHA} (${env.SHA7})"
        }
      }
    }

    stage('Docker Login') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'docker-hub-creds',
          usernameVariable: 'DOCKER_HUB_USERNAME',
          passwordVariable: 'DOCKER_HUB_PASSWORD'
        )]) {
          sh '''
            echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_HUB_USERNAME" --password-stdin
          '''
        }
      }
    }

    stage('Build & Push Frontend') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'docker-hub-creds',
          usernameVariable: 'DOCKER_HUB_USERNAME',
          passwordVariable: 'DOCKER_HUB_PASSWORD'
        )]) {
          sh '''
            IMAGE_NAME=${DOCKER_HUB_USERNAME}/ci-cd-frontend
            docker build -t $IMAGE_NAME:latest -t $IMAGE_NAME:${SHA7} ./CI-CD-Frontend
            docker push $IMAGE_NAME:latest
            docker push $IMAGE_NAME:${SHA7}
          '''
        }
      }
    }

    stage('Deploy to EC2') {
      steps {
        sshagent(credentials: ['ec2-ssh-key']) {
          sh '''
            ssh -o StrictHostKeyChecking=no ubuntu@$EC2_HOST "
              set -e
              cd ~/app
              
              echo '=== Pulling latest images ==='
              docker-compose pull
              
              echo '=== Restarting containers ==='
              docker-compose up -d
              
              echo '=== Advanced cleanup - removing old tagged images properly ==='
              
              # Method 1: Remove tags first, then images
              # Get all frontend image tags except 'latest', remove the tags
              docker images usmanhaider12/ci-cd-frontend --format '{{.Repository}}:{{.Tag}}' | grep -v ':latest$' | while read image_tag; do
                echo \"Removing tag: \$image_tag\"
                docker rmi \"\$image_tag\" 2>/dev/null || echo \"Tag \$image_tag already removed or in use\"
              done
              
              # Get all backend image tags except 'latest', remove the tags  
              docker images usmanhaider12/ci-cd-backend --format '{{.Repository}}:{{.Tag}}' | grep -v ':latest$' | while read image_tag; do
                echo \"Removing tag: \$image_tag\"
                docker rmi \"\$image_tag\" 2>/dev/null || echo \"Tag \$image_tag already removed or in use\"
              done
              
              # Method 2: Alternative - Force remove dangling images (images with <none> tag)
              DANGLING_IMAGES=\$(docker images -f 'dangling=true' -q)
              if [ ! -z \"\$DANGLING_IMAGES\" ]; then
                echo \"Removing dangling images: \$DANGLING_IMAGES\"
                docker rmi \$DANGLING_IMAGES || true
              else
                echo \"No dangling images to remove\"
              fi
              
              # Method 3: Remove images by age (keep only latest + images from last 24 hours)
              # This is more advanced - uncomment if you want to use it
              # echo '=== Removing old images (older than 24 hours, except latest) ==='
              # docker images usmanhaider12/ci-cd-frontend --format '{{.ID}} {{.Repository}}:{{.Tag}} {{.CreatedAt}}' | grep -v ':latest' | while read image_id image_tag created_at; do
              #   CREATED_TIMESTAMP=\$(date -d \"\$created_at\" +%s)
              #   CURRENT_TIMESTAMP=\$(date +%s)
              #   AGE_HOURS=\$(( (CURRENT_TIMESTAMP - CREATED_TIMESTAMP) / 3600 ))
              #   if [ \$AGE_HOURS -gt 24 ]; then
              #     echo \"Removing old image (age: \${AGE_HOURS}h): \$image_tag\"
              #     docker rmi \"\$image_tag\" 2>/dev/null || true
              #   fi
              # done
              
              # General system cleanup
              echo '=== General cleanup ==='
              docker system prune -f
              
              echo '=== Final state - Remaining images ==='
              docker images | grep usmanhaider12 || echo 'No usmanhaider12 images found'
              
              echo '=== Running containers ==='
              docker-compose ps
            "
          '''
        }
      }
    }
  }

  post {
    always {
      sh 'docker logout || true'
    }
    success {
      echo "✅ Successfully deployed images tagged: latest and ${env.SHA7}"
      echo "🧹 Cleanup completed - only 'latest' tags should remain"
    }
    failure {
      echo "❌ Build failed. Check the stage that errored above."
    }
  }
}
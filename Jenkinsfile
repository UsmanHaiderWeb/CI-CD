pipeline {
  agent any

  options {
    ansiColor('xterm')
    timestamps()
    disableConcurrentBuilds()
  }

  // If you also ticked "GitHub hook trigger for GITScm polling" in the job,
  // this makes webhook → build seamless.
  triggers {
    githubPush()
  }

  environment {
    // change this to your EC2 IP or DNS
    EC2_HOST = '16.171.254.46'
  }

  stages {
    stage('Checkout (SCM)') {
      steps {
        // Use the job’s SCM config (Pipeline script from SCM).
        // This avoids the second, failing git step you saw.
        checkout([
          $class: 'GitSCM',
          branches: [[name: '*/main']],
          userRemoteConfigs: [[
            url: 'https://github.com/UsmanHaiderWeb/CI-CD.git',
            credentialsId: 'github-creds'
          ]]
        ])

        // Export a short SHA for tagging images
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
              docker-compose pull
              docker-compose up -d
              docker system prune -f
            "
          '''
        }
      }
    }
  }

  post {
    always {
      // optional: keep disk tidy on the Jenkins node
      sh 'docker logout || true'
    }
    success {
      echo "Deployed images tagged: latest and ${env.SHA7}"
    }
    failure {
      echo "Build failed. Check the stage that errored above."
    }
  }
}

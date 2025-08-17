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
    EC2_HOST = '13.49.35.43'
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
            docker build -t $IMAGE_NAME:latest ./CI-CD-Frontend
            docker push $IMAGE_NAME:latest
          '''
        }
      }
    }

    stage('Deploy to EC2') {
      steps {
        sshagent(credentials: ['ec2-ssh-key']) {
          sh '''
            ssh -o StrictHostKeyChecking=no ubuntu@$EC2_HOST "
              nohup ~/app/deploy.sh > ~/app/deploy.log 2>&1 &
              echo 'Deployment triggered in background. Check ~/app/deploy.log on EC2.'
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
      echo "✅ Successfully deployed commit ${env.SHA7} as latest"
      echo "💡 To rollback: redeliver webhook for previous commit"
    }
    failure {
      echo "❌ Build failed. Check the stage that errored above."
    }
  }
}
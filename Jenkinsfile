node {
  try {
    stage('Checkout') {
      checkout scm
    }
    stage('Environment') {
      sh 'git --version'
      echo "Branch: ${env.BRANCH_NAME}"
      sh 'docker -v'
      sh 'printenv'
    }
    stage('docker build/push') {
      docker.withRegistry('https://index.docker.io/v1/', 'dockerhub') {
        def app = docker.build("mukeshdhamat/nodejs:latest", '.').push()
      }
    }
    stage('remove images') {
      sh 'docker rmi mukeshdhamat/nodejs:latest'
    }
  }
  catch (err) {
    throw err
  }
}

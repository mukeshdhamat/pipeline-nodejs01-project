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
      docker.withRegistry('https://878627739692.dkr.ecr.ap-south-1.amazonaws.com/nodejs', 'ecr:ap-south-1:aws_ecr') {
        def app = docker.build("878627739692.dkr.ecr.ap-south-1.amazonaws.com/nodejs:latest", '.').push()
      }
    }
    stage('remove images') {
      sh 'docker rmi 878627739692.dkr.ecr.ap-south-1.amazonaws.com/nodejs:latest'
    }
    stage('stop and remove docker-compose') {
      sh 'docker-compose stop'
      sh 'docker-compose rm -f'
    }
    stage('Run docker-compose') {
      sh 'docker-compose up -d'
    }
  }
  catch (err) {
    throw err
  }
}

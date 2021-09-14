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
    stage ('ecr login') {
      sh 'aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 878627739692.dkr.ecr.ap-south-1.amazonaws.com'
    }
    stage('docker build/push') {
      docker.withRegistry('https://878627739692.dkr.ecr.ap-south-1.amazonaws.com/nodejs', 'aws_ecr') {
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

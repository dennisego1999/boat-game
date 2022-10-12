@servers(['staging' => ['websitepreviewbe@ssh.websitepreview.be']])

@task('deploy', ['on' => 'staging'])
cd subsites/boat-experience.websitepreview.be
git fetch --prune
git stash
git pull origin main
npm install
npm run build
@endtask

c1commit() {
  message="$1"
  git add --all  
  git commit -m "$message" 
  git push
}


if [ $# -gt 0 ]
then
  c1commit "$*"
else
  c1commit "update"
fi 

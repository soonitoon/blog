git add .
git commit -m 'Update docs'
git push origin master
if [[ $!  -eq 0 ]]; then
    echo 'Published! 📖'
fi
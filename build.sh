rm -f out.tsv

for f in $(find ./pages -name '*.html'); do
    IFS=/ read -a parts <<< $f
    sed -r -n 's/rating_fullview_container/\n/gp' < $f | sed -r -n 's/^.*?\.([0-9]+)\/" class="username".+BAscore_norm">([0-9.]+)<.*?$/\1 \2/gp' | awk -v id="${parts[2]}" '{ print id,"\t",$1,"\t",$2 }' >> out.tsv
done
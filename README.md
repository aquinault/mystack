# mystack

#  How to get bash or ssh into a running container in background mode?
sudo docker exec -i -t loving_heisenberg bash #by Name

# Creation de l'index pour les images
curl -XPUT http://localhost:9200/adimages -d'
{
    "mappings" : {
    "images" : {
        "properties" : {
            "image" : { "type" : "binary"},
            "name" : { "type" : "string"},
            "id_image" : {"type" : "string"},
            "created_at": {
                "type":   "date",
                "format": "yyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
            }
        }
    }}
};'

# Creation de l'index pour les annonces
curl -XPUT http://localhost:9200/annonces -d'
{
    "mappings" : {
    "annonces" : {
        "properties" : {
            "name" : { "type" : "string"},
            "description" : { "type" : "string"},
            "picture" : { "type" : "string"},
            "email" : { "type" : "string"},
            "url" : { "type" : "string"},
            "telephone" : { "type" : "string"},
            "positionx" : { "type" : "string"},
            "positiony" : { "type" : "string"},
            "created_at": {
                "type":   "date",
                "format": "yyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
            },
            "start_at": {
                "type":   "date",
                "format": "yyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
            },
            "end_at": {
                "type":   "date",
                "format": "yyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
            },
            "id_qrcode" : { "type" : "string"}

        }
    }}
};'

# Suppression d'un index
curl -XDELETE 'http://localhost:9200/annonces/'
curl -XDELETE 'http://localhost:9200/adimages/'

# Insertion d'une image
openssl base64 -in <infile> -out <outfile>
curl -XPOST '192.168.99.100:9200/adimages/images/1' -d '{ "image": "... base64 encoded image ..."}'

# Get d'une image
curl -XGET 'http://192.168.99.100:9200/adimages/_search?q=_id:1'


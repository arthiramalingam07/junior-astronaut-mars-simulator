import requests


class NASADataFetcher:

    SEARCH_URL = "https://images-api.nasa.gov/search"

    def __init__(self):

        self.cache = None

    def get_fallback_image(self):

        return {

            "title": "Mars Landscape",

            "description": "Local Mars fallback image.",

            "image_url": "/static/images/mars-fallback.svg",

            "source": "Local fallback",

            "nasa": False

        }

    def search_mars_images(self):

        if self.cache:

            return self.cache

        try:

            response = requests.get(

                self.SEARCH_URL,

                params={

                    "q": "Mars surface",

                    "media_type": "image",

                    "page_size": 10

                },

                timeout=5

            )

            response.raise_for_status()

            items = response.json().get(
                "collection", {}
            ).get("items", [])

            for item in items:

                data = item.get("data", [])

                links = item.get("links", [])

                image = next(
                    (
                        link.get("href")
                        for link in links
                        if link.get("render") in (None, "image")
                        and link.get("href", "").startswith("https://")
                    ),
                    None
                )

                if data and image:

                    self.cache = {

                        "title": data[0].get(
                            "title", "Mars image"
                        ),

                        "description": data[0].get(
                            "description", ""
                        ),

                        "image_url": image,

                        "source": "NASA Image and Video Library",

                        "nasa": True

                    }

                    return self.cache

        except (
            requests.RequestException,
            ValueError,
            TypeError,
            AttributeError
        ):

            pass

        return self.get_fallback_image()
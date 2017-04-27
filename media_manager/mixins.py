import json

class JsonMixin(object):
    def to_json(self, data, pretty=True):
        if pretty:
            return json.dumps(data, sort_keys=True, indent=4, separators=(',', ': '))
        return json.dumps(data)

    def from_json(self, str):
        return json.loads(str)

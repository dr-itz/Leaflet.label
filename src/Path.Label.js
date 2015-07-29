L.Path.include({
	showLabel: function () {
		if (this.label && this._map) {
			this.label.setLatLng(this._getDistanceCenter());
			this._map.showLabel(this.label);
		}

		return this;
	},

	hideLabel: function () {
		if (this.label) {
			this.label.close();
		}
		return this;
	},

	setLabelNoHide: function (noHide) {
		if (this._labelNoHide === noHide) {
			return;
		}

		this._labelNoHide = noHide;

		if (noHide) {
			this._removeLabelRevealHandlers();
			this.showLabel();
		} else {
			this._addLabelRevealHandlers();
			this.hideLabel();
		}
	},

	isLabelNoHide: function () {
		return this._labelNoHide;
	},

	bindLabel: function (content, options) {
		if (!this.label || this.label.options !== options) {
			this.label = new L.Label(options, this);
		}

		this.label.setContent(content);
		this._labelNoHide = options && options.noHide;

		if (!this._showLabelAdded) {
			if (this._labelNoHide) {
				this.on('add', this._onPathAdd, this);
			} else {
				this._addLabelRevealHandlers();
			}
			this.on('remove', this._hideLabel, this);
			this._showLabelAdded = true;
		}

		return this;
	},

	unbindLabel: function () {
		if (this.label) {
			this._hideLabel();
			this.label = null;
			this._showLabelAdded = false;
			if (this._labelNoHide) {
				this.off('add', this._onPathAdd, this);
			} else {
				this._removeLabelRevealHandlers();
			}
			this.off('remove', this._hideLabel, this);
		}
		return this;
	},

	updateLabelContent: function (content) {
		if (this.label) {
			this.label.setContent(content);
		}
	},

	getLabel: function () {
		return this.label;
	},

	_getDistanceCenter: function () {
		var i,
			points = this._rings[0],
			dist = [],
			totalDist,
			halfDist,
			tmp;

		// get total distance
		for (i = 0, totalDist = 0; i < points.length - 1; i++) {
			tmp = points[i].distanceTo(points[i + 1]);
			totalDist += tmp;
			dist.push(tmp);
		}

		// search which segment has the middle
		halfDist = totalDist / 2;
		for (i = 0, tmp = 0; i < dist.length && tmp < halfDist; i++) {
			tmp += dist[i];
		}
		var p1 = points[i - 1];
		var p2 = points[i];
		var c = dist[i - 1];

		// calc point on that line
		var a = p2.y - p1.y,
			b = p2.x - p1.x;
		var l = c - (tmp - halfDist);
		return this._map.layerPointToLatLng([
			(p1.x + l * b / c),
			(p1.y + l * a / c)
		]);
	},

	_onPathAdd: function () {
		if (this._labelNoHide) {
			this.showLabel();
		}
	},

	_addLabelRevealHandlers: function () {
		this
			.on('mouseover', this._showLabel, this)
			.on('mousemove', this._moveLabel, this)
			.on('mouseout', this._hideLabel, this);

		if (L.Browser.touch) {
			this.on('click', this._showLabel, this);
		}
	},

	_removeLabelRevealHandlers: function () {
		this
			.off('mouseover', this._showLabel, this)
			.off('mousemove', this._moveLabel, this)
			.off('mouseout', this._hideLabel, this);
		if (L.Browser.touch) {
			this.off('click', this._showLabel, this);
		}
	},

	_showLabel: function (e) {
		this.label.setLatLng(e.latlng);
		this._map.showLabel(this.label);
	},

	_moveLabel: function (e) {
		this.label.setLatLng(e.latlng);
	},

	_hideLabel: function () {
		this.label.close();
	}
});

/*
API

Audius V1 API

API version: 1.0
*/

// Code generated by OpenAPI Generator (https://openapi-generator.tech); DO NOT EDIT.

package codegen

import (
	"encoding/json"
)

// checks if the Playlist type satisfies the MappedNullable interface at compile time
var _ MappedNullable = &Playlist{}

// Playlist struct for Playlist
type Playlist struct {
	Artwork *PlaylistArtwork `json:"artwork,omitempty"`
	Description *string `json:"description,omitempty"`
	Permalink *string `json:"permalink,omitempty"`
	Id string `json:"id"`
	IsAlbum bool `json:"is_album"`
	PlaylistName string `json:"playlist_name"`
	RepostCount int32 `json:"repost_count"`
	FavoriteCount int32 `json:"favorite_count"`
	TotalPlayCount int32 `json:"total_play_count"`
	User User `json:"user"`
}

// NewPlaylist instantiates a new Playlist object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewPlaylist(id string, isAlbum bool, playlistName string, repostCount int32, favoriteCount int32, totalPlayCount int32, user User) *Playlist {
	this := Playlist{}
	this.Id = id
	this.IsAlbum = isAlbum
	this.PlaylistName = playlistName
	this.RepostCount = repostCount
	this.FavoriteCount = favoriteCount
	this.TotalPlayCount = totalPlayCount
	this.User = user
	return &this
}

// NewPlaylistWithDefaults instantiates a new Playlist object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewPlaylistWithDefaults() *Playlist {
	this := Playlist{}
	return &this
}

// GetArtwork returns the Artwork field value if set, zero value otherwise.
func (o *Playlist) GetArtwork() PlaylistArtwork {
	if o == nil || IsNil(o.Artwork) {
		var ret PlaylistArtwork
		return ret
	}
	return *o.Artwork
}

// GetArtworkOk returns a tuple with the Artwork field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *Playlist) GetArtworkOk() (*PlaylistArtwork, bool) {
	if o == nil || IsNil(o.Artwork) {
		return nil, false
	}
	return o.Artwork, true
}

// HasArtwork returns a boolean if a field has been set.
func (o *Playlist) HasArtwork() bool {
	if o != nil && !IsNil(o.Artwork) {
		return true
	}

	return false
}

// SetArtwork gets a reference to the given PlaylistArtwork and assigns it to the Artwork field.
func (o *Playlist) SetArtwork(v PlaylistArtwork) {
	o.Artwork = &v
}

// GetDescription returns the Description field value if set, zero value otherwise.
func (o *Playlist) GetDescription() string {
	if o == nil || IsNil(o.Description) {
		var ret string
		return ret
	}
	return *o.Description
}

// GetDescriptionOk returns a tuple with the Description field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *Playlist) GetDescriptionOk() (*string, bool) {
	if o == nil || IsNil(o.Description) {
		return nil, false
	}
	return o.Description, true
}

// HasDescription returns a boolean if a field has been set.
func (o *Playlist) HasDescription() bool {
	if o != nil && !IsNil(o.Description) {
		return true
	}

	return false
}

// SetDescription gets a reference to the given string and assigns it to the Description field.
func (o *Playlist) SetDescription(v string) {
	o.Description = &v
}

// GetPermalink returns the Permalink field value if set, zero value otherwise.
func (o *Playlist) GetPermalink() string {
	if o == nil || IsNil(o.Permalink) {
		var ret string
		return ret
	}
	return *o.Permalink
}

// GetPermalinkOk returns a tuple with the Permalink field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *Playlist) GetPermalinkOk() (*string, bool) {
	if o == nil || IsNil(o.Permalink) {
		return nil, false
	}
	return o.Permalink, true
}

// HasPermalink returns a boolean if a field has been set.
func (o *Playlist) HasPermalink() bool {
	if o != nil && !IsNil(o.Permalink) {
		return true
	}

	return false
}

// SetPermalink gets a reference to the given string and assigns it to the Permalink field.
func (o *Playlist) SetPermalink(v string) {
	o.Permalink = &v
}

// GetId returns the Id field value
func (o *Playlist) GetId() string {
	if o == nil {
		var ret string
		return ret
	}

	return o.Id
}

// GetIdOk returns a tuple with the Id field value
// and a boolean to check if the value has been set.
func (o *Playlist) GetIdOk() (*string, bool) {
	if o == nil {
		return nil, false
	}
	return &o.Id, true
}

// SetId sets field value
func (o *Playlist) SetId(v string) {
	o.Id = v
}

// GetIsAlbum returns the IsAlbum field value
func (o *Playlist) GetIsAlbum() bool {
	if o == nil {
		var ret bool
		return ret
	}

	return o.IsAlbum
}

// GetIsAlbumOk returns a tuple with the IsAlbum field value
// and a boolean to check if the value has been set.
func (o *Playlist) GetIsAlbumOk() (*bool, bool) {
	if o == nil {
		return nil, false
	}
	return &o.IsAlbum, true
}

// SetIsAlbum sets field value
func (o *Playlist) SetIsAlbum(v bool) {
	o.IsAlbum = v
}

// GetPlaylistName returns the PlaylistName field value
func (o *Playlist) GetPlaylistName() string {
	if o == nil {
		var ret string
		return ret
	}

	return o.PlaylistName
}

// GetPlaylistNameOk returns a tuple with the PlaylistName field value
// and a boolean to check if the value has been set.
func (o *Playlist) GetPlaylistNameOk() (*string, bool) {
	if o == nil {
		return nil, false
	}
	return &o.PlaylistName, true
}

// SetPlaylistName sets field value
func (o *Playlist) SetPlaylistName(v string) {
	o.PlaylistName = v
}

// GetRepostCount returns the RepostCount field value
func (o *Playlist) GetRepostCount() int32 {
	if o == nil {
		var ret int32
		return ret
	}

	return o.RepostCount
}

// GetRepostCountOk returns a tuple with the RepostCount field value
// and a boolean to check if the value has been set.
func (o *Playlist) GetRepostCountOk() (*int32, bool) {
	if o == nil {
		return nil, false
	}
	return &o.RepostCount, true
}

// SetRepostCount sets field value
func (o *Playlist) SetRepostCount(v int32) {
	o.RepostCount = v
}

// GetFavoriteCount returns the FavoriteCount field value
func (o *Playlist) GetFavoriteCount() int32 {
	if o == nil {
		var ret int32
		return ret
	}

	return o.FavoriteCount
}

// GetFavoriteCountOk returns a tuple with the FavoriteCount field value
// and a boolean to check if the value has been set.
func (o *Playlist) GetFavoriteCountOk() (*int32, bool) {
	if o == nil {
		return nil, false
	}
	return &o.FavoriteCount, true
}

// SetFavoriteCount sets field value
func (o *Playlist) SetFavoriteCount(v int32) {
	o.FavoriteCount = v
}

// GetTotalPlayCount returns the TotalPlayCount field value
func (o *Playlist) GetTotalPlayCount() int32 {
	if o == nil {
		var ret int32
		return ret
	}

	return o.TotalPlayCount
}

// GetTotalPlayCountOk returns a tuple with the TotalPlayCount field value
// and a boolean to check if the value has been set.
func (o *Playlist) GetTotalPlayCountOk() (*int32, bool) {
	if o == nil {
		return nil, false
	}
	return &o.TotalPlayCount, true
}

// SetTotalPlayCount sets field value
func (o *Playlist) SetTotalPlayCount(v int32) {
	o.TotalPlayCount = v
}

// GetUser returns the User field value
func (o *Playlist) GetUser() User {
	if o == nil {
		var ret User
		return ret
	}

	return o.User
}

// GetUserOk returns a tuple with the User field value
// and a boolean to check if the value has been set.
func (o *Playlist) GetUserOk() (*User, bool) {
	if o == nil {
		return nil, false
	}
	return &o.User, true
}

// SetUser sets field value
func (o *Playlist) SetUser(v User) {
	o.User = v
}

func (o Playlist) MarshalJSON() ([]byte, error) {
	toSerialize,err := o.ToMap()
	if err != nil {
		return []byte{}, err
	}
	return json.Marshal(toSerialize)
}

func (o Playlist) ToMap() (map[string]interface{}, error) {
	toSerialize := map[string]interface{}{}
	if !IsNil(o.Artwork) {
		toSerialize["artwork"] = o.Artwork
	}
	if !IsNil(o.Description) {
		toSerialize["description"] = o.Description
	}
	if !IsNil(o.Permalink) {
		toSerialize["permalink"] = o.Permalink
	}
	toSerialize["id"] = o.Id
	toSerialize["is_album"] = o.IsAlbum
	toSerialize["playlist_name"] = o.PlaylistName
	toSerialize["repost_count"] = o.RepostCount
	toSerialize["favorite_count"] = o.FavoriteCount
	toSerialize["total_play_count"] = o.TotalPlayCount
	toSerialize["user"] = o.User
	return toSerialize, nil
}

type NullablePlaylist struct {
	value *Playlist
	isSet bool
}

func (v NullablePlaylist) Get() *Playlist {
	return v.value
}

func (v *NullablePlaylist) Set(val *Playlist) {
	v.value = val
	v.isSet = true
}

func (v NullablePlaylist) IsSet() bool {
	return v.isSet
}

func (v *NullablePlaylist) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullablePlaylist(val *Playlist) *NullablePlaylist {
	return &NullablePlaylist{value: val, isSet: true}
}

func (v NullablePlaylist) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullablePlaylist) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}



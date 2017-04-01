import React from 'react';
import InlineEdit from 'react-edit-inline';
var socket = io.connect('/io/resources');

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {id: props.projectid, user: props.user, name: null, url: null};
  }

  componentDidMount() {
    // Tell other clients a change occured
    socket.emit('room', this.props.room);
  }

  handleSubmit(event) {
    event.preventDefault();

    //if (this.state.name && this.state.url) {
    if (this.state.url) {
      if (validator.isURL(this.state.url)) {
        $('#resourcesSpinner').css('visibility', 'visible');

        axios.post('/api/resources', {
          projectID: this.state.id,
          name: this.state.name,
          link: this.state.url,
          user: this.state.user
        }).then(function(response) {
          socket.emit('change', 'post');
          $('#resourcesSpinner').css('visibility', 'hidden');
        });

        this.setState({name: null, url: null});
        document.getElementById('resourceForm').reset();
        $('#resourceForm').css('border', 'none');
      } else {
        $('#resourceForm').css('border', '2px solid red');
      }
    } else {
      $('#resourceForm').css('border', '2px solid red');
    }
  }

  render() {
    //var styleTemp = { width: '50%', margin: '0 auto' };

    return (
      <form id="resourceForm" className="form-inline" onSubmit={this.handleSubmit.bind(this)}>
        {/*<div className="col-12">
          <label className="sr-only" htmlFor="resource-input-name">Resource Name</label>
          <input type="text" className="form-control mb-2 mr-sm-2 mb-sm-0" id="resource-input-name" placeholder="Name"
            onChange={(event) => this.setState({name: event.target.value})} />
        </div>*/}
        <div className="col-12">
          <label className="sr-only" htmlFor="resource-input-url">Resource Url</label>
          <input type="text" className="form-control mb-2 mr-sm-2 mb-sm-0" id="resource-input-url" placeholder="Url"
            onChange={(event) => this.setState({url: event.target.value})} />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">Add</button>
        </div>
        <div id="resourcesSpinner" style={{ width: '50%', margin: '0 auto', visibility: 'hidden' }}>
          <i className="fa fa-spinner fa-pulse fa-2x fa-fw"></i>
        </div>
      </form>
    );
  }
};

class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {project: props.project, resources: null};

    this.dataChanged = this.dataChanged.bind(this);

    this.getResources();
  }

  componentDidMount() {
    // Listen for a call to rerender the list
    socket.on('reload', this.getResources.bind(this));
  }

  dataChanged(data, a) {
      // data = { description: "New validated text comes here" }
      // Update your model from here
      console.log(data, ' ', a);
      //this.setState({...data})
  }

  customValidateText(text) {
    return (text.length > 0);
  }

  getResources() {
    var context = this;
    var project = this.state.project;
    axios.get('/api/resources?id=' + project.id)
    .then(function(response) {
      context.state.resources = response.data;
      context.forceUpdate();
    });
  }

  deleteResource(resourceID) {
    axios.delete('/api/resources?id=' + resourceID)
    .then(function(response) {
      // Tell other clients a change occured
      socket.emit('change', 'delete');
    });
  }

  render() {
    if (this.state.resources === null) {
      return (
        <div><i className="fa fa-spinner fa-pulse fa-5x fa-fw"></i></div>
      );
    } else {
      return (
        <div className="resources-section-body">
          {this.state.resources.map((resource) =>
            <Resource resource={resource}
                      deleteResource={this.deleteResource.bind(this)}
                      customValidateText={this.customValidateText.bind(this)}
                      dataChanged={this.dataChanged.bind(this)} />
          )}
        </div>
      );
    }
  }
};

var Resource = ({resource, deleteResource, customValidateText, dataChanged}) => (
  <div className = "resource">
    {console.log(resource)}
    {/*<i className="fa fa-external-link"></i>*/}
    {resource.user}:
    {/*<a className="resourceName" target="_blank" href={resource.link}>{resource.name}</a>*/}
    {/*<a className="resourceName" target="_blank" href={resource.link.indexOf('http://') > -1 || resource.link.indexOf('https://') > -1 ? resource.link : 'http://' + resource.link}>{resource.name}</a>*/}
    <InlineEdit
              validate={customValidateText}
              activeClassName="editing"
              text={resource.name}
              paramName="name"
              change={dataChanged}
              style={{
                //backgroundColor: 'yellow',
                //minWidth: 150,
                display: 'inline-block',
                //margin: 'margin: 0 15px 15px 0',
                // 'margin-right': '5px',
                //padding: 0,
                //fontSize: 15,
                outline: 0,
                border: 0
              }}
              className="resourceName"
              editing={() => { console.log('i am here'); } }
            />

    <i className="fa fa-external-link externalLink" aria-hidden="true" onClick={() =>
      window.open(resource.link.indexOf('http://') > -1 || resource.link.indexOf('https://') > -1 ? resource.link : 'http://' + resource.link, '_blank')
    }></i>
    <i className="fa fa-times deleteResource" aria-hidden="true" onClick={() => deleteResource(resource.id)}></i>
  </div>
);

exports.Form = Form;
exports.List = List;



/*<a className="resourceName" onClick={() =>
        window.open(resource.link.indexOf('http://') > -1 || resource.link.indexOf('https://') > -1 ? resource.link : 'http://' + resource.link, '_blank')
      }>{resource.name}</a>*/
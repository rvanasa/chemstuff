/* global angular */
angular.module('chemthings', ['ngSanitize'])

.component('app', {
	templateUrl: 'component/app.html',
	controller($interval, Input, Output, EvalService)
	{
		EvalService.addImport('lib/util/array-extensions');
			
		this.autorun = true;
		
		this.script = window.localStorage.getItem('lastScript') || '';
		
		this.input = Input;
		this.output = Output;
		
		this.onType = () =>
		{
			saveFlag = true;
		}
		
		this.saveScript = () =>
		{
			window.localStorage.setItem('lastScript', this.script || '');
		}
		
		this.eval = () =>
		{
			Output.result = undefined;
			EvalService.evaluate(this.script);
			if(!Output.status) Output.status = 'Evaluated successfully.';
		}
		
		this.evalSilent = () => EvalService.evaluate(this.script);
		
		this.evalSilent();
		
		var saveFlag = false;
		$interval(() =>
		{
			if(saveFlag)
			{
				saveFlag = false;
				this.saveScript();
				if(this.autorun) this.evalSilent();
			}
		}, 100);
	}
})

.directive('aceEditor', function($timeout)
{
	function resizeEditor(editor, elem)
	{
		var lineHeight = editor.renderer.lineHeight;
		var rows = editor.getSession().getLength();
		
		angular.element(elem).height(rows * lineHeight);
		editor.resize();
	}
	
	return {
		restrict: 'A',
		require: '?ngModel',
		scope: true,
		link(scope, elem, attrs, ngModel)
		{
			var node = elem[0];
			
			/* global ace */
			var editor = ace.edit(node);
			editor.$blockScrolling = Infinity;
			
			editor.setShowPrintMargin(false);
			editor.setTheme('ace/theme/textmate');
			editor.setOptions({
				enableBasicAutocompletion: true,
				enableLiveAutocompletion: false,
			});
			
			editor.getSession().setMode('ace/mode/javascript');
			
			ngModel.$render = () =>
			{
				var shouldDeselect = editor.getValue() == '';
				
				editor.setValue(ngModel.$viewValue || '');
				resizeEditor(editor, elem);
				
				if(shouldDeselect)
				{
					editor.selection.clearSelection();
				}
			};
			
			editor.on('change', () =>
			{
				$timeout(() =>
				{
					scope.$apply(() =>
					{
						var value = editor.getValue();
						ngModel.$setViewValue(value);
					});
				});
				resizeEditor(editor, elem);
			});
		}
	};
})

.value('Input', [])
.value('Output', {status: null})

.factory('Buffer', function()
{
	return class Buffer
	{
		constructor()
		{
			this.waiting = 0;
			this.callbacks = [];
		}
		
		run(callback)
		{
			if(this.waiting)
			{
				this.callbacks.push(callback);
			}
			else
			{
				callback();
			}
		}
		
		wait()
		{
			this.waiting++;
		}
		
		resume()
		{
			this.waiting--;
			if(!this.waiting)
			{
				for(var i = 0; i < this.callbacks.length; i++)
				{
					this.callbacks[i]();
				}
				this.callbacks.length = 0;
			}
		}
	}
})

.factory('Sandbox', function()
{
	var sandbox = document.createElement('iframe');
	sandbox.hidden = true;
	document.body.appendChild(sandbox);
	
	return {
		element: sandbox,
		window: sandbox.contentWindow,
	};
})

.service('EvalService', function($http, Input, Output, Buffer, Sandbox, SerializerService)
{
	var scriptBuffer = new Buffer();
	
	/* global E */
	Sandbox.window.E = E;
	
	var imports = [];
	this.addImport = (path) =>
	{
		if(~imports.indexOf(path)) return;
		imports.push(path);
		
		scriptBuffer.wait();
		
		$http.get(path + '.js').then(
			(response) =>
			{
				try {Sandbox.window.eval(response.data)}
				finally {scriptBuffer.resume()}
			},
			() =>
			{
				Output.status = `Failed to load script from '${path}'`;
				scriptBuffer.resume();
			});
	}
	
	this.evaluate = (script) =>
	{
		scriptBuffer.run(() =>
		{
			for(var key in Input)
			{
				Sandbox.window[key] = Input[key].value;
			}
			
			try
			{
				script = script.trim();
				var splitIndex = script.lastIndexOf('\n') + 1;
				script = script.substring(0, splitIndex) + 'if(output===undefined)return ' + script.substring(splitIndex).replace(/^return /g, '');
				
				Sandbox.window.output = undefined;
				var returnValue = Sandbox.window.eval('(function run() {\n' + script + '\n})()');
				
				var evalResult = Sandbox.window.output;
				if(evalResult === undefined) evalResult = returnValue;
				
				Output.current = true;
				Output.status = null;
				Output.result = SerializerService.deserialize(evalResult);
			}
			catch(e)
			{
				Output.current = false;
				Output.status = e.message;
			}
		});
	}
})

.service('SerializerService', function()
{
	this.serialize = (string, type) =>
	{
		if(type == 'string') return string;
		if(type == 'element') return E(string);
		return string;
	}
	
	this.deserialize = (value) =>
	{
		if(value === undefined) return;
		if(value === null) return 'null';
		if(typeof value == 'string' || typeof value == 'number' || typeof value == 'boolean') return value;
		if(Array.isArray(value)) return value.join('\n');
		
		return Object.keys(value).map(k => '<b>' + k + '</b>: ' + value[k]).join('\n');
	}
})
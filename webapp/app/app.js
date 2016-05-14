/* global angular */
angular.module('chemthings', ['ngSanitize'])

.component('app', {
	templateUrl: 'component/app.html',
	controller(Input, Output, EvalService)
	{
		this.autorun = true;
		
		this.script = window.localStorage.getItem('lastScript') || '';
		
		this.input = Input;
		this.output = Output;
		
		this.onType = () =>
		{
			this.saveScript();
			
			if(this.autorun) EvalService.evaluate(this.script);
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
	}
})

.directive('aceEditor', function($timeout)
{
	function resizeEditor(editor, elem)
	{
		var lineHeight = editor.renderer.lineHeight;
		var rows = editor.getSession().getLength();

		$(elem).height(rows * lineHeight);
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
			editor.setTheme('ace/theme/clouds');
			
			editor.getSession().setMode('ace/mode/javascript');
			
			var Range = require('ace/range').Range;
			
			ngModel.$render = () =>
			{
				var shouldDeselect = editor.getValue() == '';
				
				editor.setValue(ngModel.$viewValue || '');
				resizeEditor(editor, elem);
				
				if(shouldDeselect)
				{
					editor.selection.setRange(new Range());
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

.value('Input', {})
.value('Output', {status: null})

.service('EvalService', function(Input, Output)
{
	var sandbox = null;
	
	this.evaluate = (input) =>
	{
		if(sandbox)
		{
			sandbox.remove();
		}
		sandbox = document.createElement('iframe');
		sandbox.hidden = true;
		
		document.body.appendChild(sandbox);
		
		/* global findElement */
		sandbox.contentWindow.input = Input;
		sandbox.contentWindow.E = findElement;
		
		Output.status = null;
		
		try
		{
			Output.current = true;
			sandbox.contentWindow.output = '';
			sandbox.contentWindow.eval(input);
			Output.result = this.formatOutput(sandbox.contentWindow.output);
		}
		catch(e)
		{
			Output.current = false;
			Output.status = e.message;
		}
	}
	
	this.formatOutput = (data) =>
	{
		if(data instanceof Array)
		{
			return data.join('\n');
		}
		else
		{
			return data;
		}
	}
})
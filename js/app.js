(function() {
    if (window.radarioQuestionary === undefined) {
        console.error("radarioQuestionary have not been initialized :(");
    } else {
        var _Q = window.radarioQuestionary;
        var pickNextQuestion = function() {
            var q = null;
            try {
                q = _Q.questions[_Q.i];
                _Q.i++;
            } catch(e) {}
            _Q.ctx = q;
            return q;
        };
        var processToResults = function() {
            var rank = 1;
            var rankDescription = 'Вам стоит приоткрыть занавес и узнать театральное искусство поближе. ';
            if (_Q.score > 3) {
                rankDescription = 'Узнать еще больше о театре и современных постановках вы сможете 27 марта, во Всемирный день театра.';
                rank++;
            }
            if (_Q.score > 6) {
                rank++;
                rankDescription = 'Вы знаете многое об истории театра – это впечатляет!';
            }
            if (_Q.score > 9) { 
                rank++;
                rankDescription = 'Вы настоящий знаток истории театра и наверняка частенько бываете в закулисье!';
            }
            var context = {
                rank: rank,
                progress: _Q.score.toString() + ' / ' + _Q.questions.length.toString(),
                rankDescription: rankDescription
            };
            $(".mainbox").replaceWith(_Q.finishTemplate(context));
            $("#marketing-email-collector-container").replaceWith($("iframe[src*='marketing.radario.co']"));
        };
        var checkSelectizeResult = function() {
            var selections = $('.selectone option:selected');
            var incrementScore = true;
            for(var i = 0; i < selections.length; i++) {
                var getterKey = $(selections[i]).parent().siblings("input").val();
                var selectedValue = $(selections[i]).val()
                var correctValue = radarioQuestionary.ctx.variants[getterKey].correctValue;
                var $photolabel = $(selections[i]).parent().siblings("div");
                if (selectedValue == correctValue) {
                    $photolabel.addClass('photolable-ok').html('Верно! <br> &nbsp;');
                } else {
                    $photolabel.addClass('photolable-wrong').html('Правильный вариант: <br>' + correctValue);
                    incrementScore = false;
                }
                $photolabel.show();
            }
            if (incrementScore) {
                radarioQuestionary.score++;
            }
        }
        var loadQuestion = function(questionObject) {
            if (questionObject == null) {
                processToResults(); //there is no more questions left
                return;
            }
            if (questionObject.questionType == 'pickOne') {
                var context = {
                    progress: _Q.i.toString() + ' / ' + _Q.questions.length.toString(),
                    headerImage: questionObject.headerImage,
                    question: questionObject.headerText,
                    source: questionObject.source,
                    q1: questionObject.variants.a,
                    q2: questionObject.variants.b,
                    q3: questionObject.variants.c,
                    q4: questionObject.variants.d
                };
                $(".mainbox").replaceWith(_Q.pickOneTemplate(context));
                return;
            }
            if (questionObject.questionType == 'selectize') {
                var selectHTML = '<select class="selectone" onchange="radarioQuestionary.pick(this)"><option selected value="false">Выберите вариант</option>';
                var s = questionObject.variants.initalSelectize;
                for(var i = 0; i < s.length; i++) {
                    selectHTML += '<option value="' + s[i].toString() + '">' + s[i].toString() + '</option>';
                }
                selectHTML += '</select>'
                var context = {
                    progress: _Q.i.toString() + ' / ' + _Q.questions.length.toString(),
                    headerImage: questionObject.headerImage,
                    question: questionObject.headerText,
                    source: questionObject.source,
                    q1: questionObject.variants.a,
                    q2: questionObject.variants.b,
                    q3: questionObject.variants.c,
                    q4: questionObject.variants.d,
                    formedSelect: selectHTML
                };
                $(".mainbox").replaceWith(_Q.selectizeTemplate(context));
                _Q.os = $($(".selectone")[0]).children("option");
                $(".btn").click(function() {
                    var $ar = $('.selectone option:selected');
                    var err = false;
                    for(var i = 0; i < $ar.length; i++) {
                        if ($($ar[i]).val() == "false") {
                            err = true;
                        }
                    }
                    if (err) {
                        $("#err-fill").show();
                    } else {
                        checkSelectizeResult();
                        $(this).off();
                        _Q.pick();
                        $(this).text("Далее");
                    }
                });
                return;
            }
            console.error("Unknown question type");
        }
        var processMechanique1 = function(chosenAnswer) {
            var idx = chosenAnswer.charCodeAt(0) - 'a'.charCodeAt(0);
            var variants = $(".variant");
            for(var i = 0; i < variants.length; i++) {
                var classToAdd = 'inactive'
                var vr = String.fromCharCode('a'.charCodeAt(0) + i);
                if (_Q.ctx.variants[vr].isCorrect) {
                    classToAdd = 'ok';
                }
                if (i == idx) {
                    if (_Q.ctx.variants[chosenAnswer].isCorrect) {
                        classToAdd = 'ok';
                        _Q.score++;
                    } else {
                        classToAdd = 'wrong';
                    }
                    $(variants[i]).append('<div class="more">' + _Q.ctx.variants[chosenAnswer].selectText + '</div>');
                }
                $(variants[i]).addClass(classToAdd);
                $(variants[i]).children(".variant-mark").addClass(classToAdd);
            }
        }
        var processMechanique2 = function() {
            $("#err-fill").hide();
            var pickedValues = $(".selectone").filter(function() { return $(this).val() !== "false"; }).map(function() {return $(this).val()});
            var s = $(".selectone");
            for(var z = 0; z < s.length; z++) {
                $(s[z]).children("option:not(:selected)").filter(function() {
                    var alreadyPicked = false;
                    var pv = $(this).val();
                    for(var i = 0; i < pickedValues.length; i++) {
                        if (pickedValues[i] === pv) {
                            alreadyPicked = true;
                        }
                    }
                    return alreadyPicked;
                }).remove();
            };
            var variantsThatShouldBeAvailable = radarioQuestionary.os.clone().filter(function() { 
                    if ($(this).val() === "false") {
                        return false;
                    } else {
                        var alreadyPicked = false;
                        var pv = $(this).val();
                        for(var i = 0; i < pickedValues.length; i++) {
                            if (pickedValues[i] === pv) {
                                alreadyPicked = true;
                            }
                        }
                        return !alreadyPicked;
                    }
                });
            for(var z = 0; z < s.length; z++) {
                var variantsToAdd = variantsThatShouldBeAvailable.clone().filter(function(){
                    var selectContainsThisVariant = false;
                    var opts = $(s[z]).children("option");
                    for(var i = 0; i < opts.length; i++) {
                        if ($(opts[i]).val() === $(this).val()) {
                            selectContainsThisVariant = true;
                        }
                    }
                    return !selectContainsThisVariant;
                }).each(function() {
                    $(s[z]).append(this);
                });
            }
        }
        _Q.pick = function(variant) {
            if (variant != null && _Q.ctx != null) {
                if (_Q.ctx.questionType == 'selectize') {
                    processMechanique2();
                    return;
                }
                if (_Q.ctx.questionType == 'pickOne') {
                    processMechanique1(variant);
                }
                _Q.ctx = null;
            }
            $('.btn-container').show();
            $('.btn').click(function() {
                loadQuestion(pickNextQuestion());
            })
        }
        _Q.pick();
    }
}());
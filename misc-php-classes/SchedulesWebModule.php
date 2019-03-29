<?php

 class SchedulesWebModule extends WebModule
 {
   protected $id='schedules';
   protected $searchPlaceholder='Search Class Schedules';
   protected $terms = array();
   protected $termIndex = 0;
   protected $term = "";
   protected $controller;

  public function linkForValue($value, Module $callingModule, $otherValue=null) {

      switch ($callingModule->getID())
      {
          case 'courses':
            $matchedClasses = $this->controller->searchClasses($value);
          	$resultArray = array();
          	foreach ($matchedClasses as $termDesc=>$classes)
          	{
          		if ($termDesc != "TERMS")
          		{
          			$resultArray[] = 
          		array('title'=>$termDesc . " (" . count($classes) . ")",
          			  'url'=>$this->buildURLForModule($this->id, 'search', array('filter'=>$value, 'term'=>$this->getTermByName($termDesc))));
          		}
          	}
            return $resultArray;
        break;
        default:
        //return the default implementation for other modules
        return parent::linkForValue($value, $callingModule, $otherValue);
      }
  }

	protected function getTermByName($termName) {
		foreach($this->terms as $key=>$thisTerm) {
			if ($thisTerm['title'] == $termName)
				return $key;
		}
		return "";
	}

	protected function loadTerms() {
		$termData = $this->controller->getTerms();
		$returnArray = array();
		foreach($termData as $key=>$thisTerm) {
			$returnArray[] = array( "title"=>$thisTerm['VALUE'], 
									"selected"=>false,
									"value"=>$key);
		}
		return $returnArray;
	}
	
   protected function initialize() {
   		//error_log('initializing');
   		$this->controller = DataRetriever::factory('ScheduleDataRetriever', array());
   	 	$this->terms = $this->loadTerms();
        if (count($this->terms)==0) {
            return;
        }
        $this->termIndex = $this->getArg('term', 0);
        if (!isset($this->terms[$this->termIndex])) {
            $this->termIndex = key($this->terms);
        }
        $this->term = $this->terms[$this->termIndex];
        $this->terms[$this->termIndex]['selected'] = true;
   }

   protected function initializeForPage() {

     //instantiate controller
     $controller = $this->controller;
	$this->assign('placeHolder', $this->searchPlaceholder);
	$this->assign('terms', $this->terms);
     switch ($this->page)
     {
        case 'index':    
             //get the departments(subjects)
             $subjects = $controller->getSubjects($this->term['title']);
             //prepare the list
             $subjectsList = array();
             foreach ($subjects as $subjectData) {
                 $subject = array(
                     'title'=> $subjectData['DepartmentName'],
                     'subtitle'=> $subjectData['VALUE'],
                     'url'=> $this->buildBreadcrumbURL('subject', array('id'=>$subjectData['VALUE'],'term'=>$this->term['value']))
                 );
                 $subjectsList[] = $subject;
             }
             //assign the list to the template
             $this->assign('subjectsList', $subjectsList);
             break;
    	
    	case 'subject':    
             //get the courselist
             $prefix = $this->getArg('id');
             $classes = $controller->getClassesBySubject($prefix, $this->term['title']);
             foreach ($classes as $termName => $termClasses)
             {
             	if($termName != "TERMS")
             	{
             		foreach ($termClasses as $key => $item)
             		{
             			$classes[$termName][$key]['SectionNumber'] = str_pad($classes[$termName][$key]['SectionNumber'], 2, "0", STR_PAD_LEFT);
             			$classes[$termName][$key]['url'] = $this->buildBreadcrumbURL('detail', array('id'=>$item['CRN']));
             		}
             	}
             }
             $this->assign('classes', $classes);
             break;
             
    	case 'search':    
             //get the courselist
             $searchterm = $this->getArg('filter');
             $classes = $controller->searchClasses($searchterm, $this->term['title']);
             $countClasses = 0;
             $classId = "";
             foreach ($classes as $termName => $termClasses)
             {
             	if($termName == $this->term['title'])
             	{
             		foreach ($termClasses as $key => $item)
             		{
             			$classes[$termName][$key]['url'] = $this->buildBreadcrumbURL('detail', array('id'=>$item['CRN']));
             			$countClasses = $countClasses + 1;
             			$classId = $item['CRN'];
             		}
             	}
             }
             if ($countClasses == 1)
             	$this->redirectTo('detail', array('id'=>$classId), true);
             	
             $this->assign('classCount', $countClasses);
             $this->assign('classes', array($this->term['title']=>$classes[$this->term['title']]));
             $this->assign('searchTerms', $searchterm);
             break;
             
        case 'detail':    
             $courseId = $this->getArg('id');
             if ($classDetail = $controller->getClassDetail($courseId)) {
             
             	$classCode = $classDetail['Subject'] . ' ' . $classDetail['CrseNumb'];
             	$classCode .= '&ndash;' . str_pad($classDetail['SectionNumber'], 2, "0", STR_PAD_LEFT);
             	$classTitle =  $classDetail['Title'];
             	$subTitle = $classDetail['TermDescription'];
             	if ($classDetail['Days'])
             		$subTitle .=  ' &bull; Days: ' . $classDetail['Days'];
             	 //. ' &bull; ' .  $classDetail['MeetingTime']
             	
             	$this->assign('classcode', $classCode);
             	$this->assign('classtitle', $classTitle);
             	$this->assign('subtitle', $subTitle);
             	
             		// This should be added to config file
             		$detailFields = array(
             			"TermDescription" => "Term",
						"Days" => "Days",
						"MEETINGTIME" => "Meeting Time",
						"SectionNumber" => "Section"
					);
					
             		$classArray = array();
             		foreach ($detailFields as $label => $field)
             		{
             			$classArray[] = array (
             				"label" => $field,
             				"title" => $classDetail[$label]
             			);
             		}
             		$classArray[] = array(
             			"label"=>"Seats Available",
             			"title"=>$classDetail['SEATSAVAILABLE'] . " / " . $classDetail['MAXENROLLMENT']
             			);
             		
             		if($classDetail['PrimaryInstructor'] != "STAFF")
             		{
            		$instructor = Kurogo::moduleLinkForValue('people', $classDetail['PrimaryInstructor'], $this);
            		$instructor['label'] = '<div class="label">Instructor</div>';
            		$this->assign('instructor', array($instructor));
            		}
            	
             		if($classDetail['BLDG'])
             		{
            		$location = Kurogo::moduleLinkForValue('map', $classDetail['BLDG'], $this);
            		$location['label'] = '<div class="label">Location</div>';
            		if($classDetail['Room'])
            			$location['title'] = $location['title'] .' '.$classDetail['Room'];
            		$this->assign('location', array($location));
            		}
            		
             		if($classDetail['NOTES'])
             		{
            		$this->assign('classNote', $classDetail['NOTES']);
            		}
            		
					$this->assign('classDetail', $classArray);
					
					$this->assign('courseDescriptionLink', array(Kurogo::moduleLinkForValue('courses', $classDetail['Subject'] . ' ' . $classDetail['CrseNumb'], $this)));
					
				} else {
					$this->redirectTo('index');
				}
             break;
     }
   }
   
   
 }
 
 ?>

<?php

class SystemstatusAPIModule extends APIModule {

    protected $id = 'systemstatus';
	protected $callback = 'j';
	
    private function loadResponseIfNeeded() {
        if (!isset($this->response)) {
            $this->response = new APIResponse($this->id, $this->configModule, $this->command);
        }
    }


	public function executeCommand() {
        if (empty($this->command)) {
            throw new KurogoException("Command not specified");
        }
        $this->loadResponseIfNeeded();
        $this->loadSiteConfigFile('strings');
    
        $this->initializeForCommand();
        
        $json = $this->response->getJSONOutput();
        $json = $this->callBack . '(' . $json . ');';
        $size = strlen($json);
        if ($this->logView) {
            $this->logCommand($size);
        }
        header("Content-Length: " . $size);
        header("Content-Type: application/javascript; charset=utf-8");
        echo $json;
        exit();
    }


     protected function initializeForCommand() {
        //instantiate controller
     	$arguments = array('CACHE_LIFETIME' => 60, //cache status for 1 minute
                        'PARSER_CLASS' => 'SimpleXMLDataParser');
		
     	$controller = DataRetriever::factory('URLDataRetriever', $arguments);
        $controller->setCacheLifeTime(120);
        switch ($this->command) {
			case 'all':
			try {
			$this->callBack = $this->getArg('callback');
        	$this->callBack = preg_replace('/[^a-zA-Z0-9]/', '', $this->callBack);
        	if(!$this->callBack)
        		$this->callBack = "j";
			
				$deviceIDs = explode(',', $this->options('deviceIDs'));
				$deviceIDs = implode('&filter_objid=', $deviceIDs);
        	$controller->setURL($this->options('baseURL') . $deviceIDs);
        		$deviceData = $controller->getData();
                $this->setResponse($deviceData['item']);
                $this->setResponseVersion(1);
			} catch(Exception $e) {
				$this->setResponse('Error: ' . $e->getMessage());
				$this->setResponseVersion(1);	
			}
			break;
            default:
                $this->invalidCommand();
                $this->setResponseVersion(1);
                break;
        }
    }
     
}

?>
